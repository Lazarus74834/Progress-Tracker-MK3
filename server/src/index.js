const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

// Import new progression engine
const {
  getStarProgress,
  generateProgressionPath: generatePath,
  STAR_DISPLAY_NAMES
} = require('./progressionEngine');

const { SUBJECT_CODES } = require('./syllabusConfig');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Set up multer to store files in memory only
const storage = multer.memoryStorage();

const upload = multer({ storage });

// Process CSV and generate report
app.post('/api/process', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Convert buffer to string and parse CSV
    const fileContent = req.file.buffer.toString('utf8');
    const results = [];

    // Use csv-parser with a stream from the string
    const readableStream = new Readable();
    readableStream.push(fileContent);
    readableStream.push(null); // Signal the end of the stream
    
    readableStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        try {
          // Process the data
          const processedData = processDataForExcel(results);
          
          // Generate Excel file in memory
          const workbook = generateExcelWorkbook(processedData);
          
          // Create a buffer for the Excel file
          const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
          
          // Convert the buffer to a base64 string
          const excelBase64 = excelBuffer.toString('base64');
          
          // Send processed data back to client for preview with the base64 Excel data
          res.json({
            message: 'File processed successfully',
            data: processedData,
            // Instead of a download path, we'll send the actual Excel data
            excelData: excelBase64,
            // Include additional info for the frontend
            fileInfo: {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              name: `ACF_Progress_Report_${new Date().toISOString().split('T')[0]}.xlsx`
            }
          });
          
          console.log("Excel data generated and sent to client");
        } catch (error) {
          console.error('Error processing CSV data:', error);
          res.status(500).json({ error: 'Error processing data' });
        }
      });
  } catch (error) {
    console.error('Error reading file buffer:', error);
    res.status(500).json({ error: 'Error reading uploaded file' });
  }
});

// Subject name mapping with corrected acronyms (now imported from config)
const subjectFullNames = SUBJECT_CODES;

// Process data for Excel output
function processDataForExcel(data) {
  // Extract cadets with rank, name, and achievements
  const cadets = data.map(row => {
    // Extract rank and name from the real data format
    const cadetField = row.Cadet || '';
    
    // The format appears to be "Cdt [optional rank] Name"
    const rankMatch = cadetField.match(/Cdt\s+(LCpl|Cpl|Sgt|SSgt|CSM|RSM)?\s*(.*)/i);
    
    let rank = rankMatch && rankMatch[1] ? rankMatch[1] : 'Cdt'; // Default to 'Cdt' if no rank found
    const name = rankMatch && rankMatch[2] ? rankMatch[2].trim() : cadetField.replace('Cdt', '').trim();
    
    console.log("Extracted rank:", rank, "name:", name);

    // Get achievements for each subject
    const achievements = {
      DT: row.DT || '',
      SAA: row.SAA || '',
      SH: row.SH || '',
      NAV: row.NAV || '',
      FC: row.FC || '',
      FA: row.FA || '',
      EXP: row.EXP || '',
      PHYS: row.PHYS || '',
      CE: row.CE || '',
      MK: row.MK || '',
      JCIC: row.JCIC || '',
      SCIC: row.SCIC || '',
      AT: row.AT || '',
      CIS: row.CIS || ''
    };

    // Use new progression engine
    const cadetInfo = { rank, flags: {} };
    const { highestComplete, training, passedModules } = getStarProgress(achievements, cadetInfo);
    const starLevel = STAR_DISPLAY_NAMES[highestComplete];

    // Generate progression path using new engine (pass current achieved level, not training level)
    const progressionPath = generatePath(achievements, highestComplete, passedModules);

    // If cadet needs many subjects, summarize
    if (progressionPath && progressionPath.requiredSubjects && progressionPath.requiredSubjects.length > 7) {
      progressionPath.requiredSubjects = [`All subjects needed for ${progressionPath.nextLevel}`];
    }

    // Set rank as 'Rct' for recruits
    if (starLevel === 'Recruit' && rank === 'Cdt') {
      rank = 'Rct';
    }

    const pNumber = row.PNumber || '';
    console.log("P-Number:", pNumber);
    
    return {
      rank,
      name,
      pNumber,
      achievements,
      starLevel,
      progressionPath
    };
  });

  // Sort cadets by star level, rank, then name
  const sortedCadets = sortCadets(cadets);

  // Generate summary statistics
  const summary = generateSummary(sortedCadets);

  // Log the first cadet for debugging
  if (sortedCadets.length > 0) {
    console.log("First cadet in results:", JSON.stringify(sortedCadets[0]));
  }

  return {
    cadets: sortedCadets,
    summary
  };
}

// Old functions removed - now using progressionEngine.js

// Sort cadets by star level, rank, and name
function sortCadets(cadets) {
  const rankOrder = {
    'RSM': 8,
    'CSM': 7,
    'SSgt': 6,
    'Sgt': 5,
    'Cpl': 4,
    'LCpl': 3,
    'Cdt': 2,
    'Rct': 1,
    '': 0
  };

  const starOrder = {
    '4*': 5,
    '3*': 4,
    '2*': 3,
    '1*': 2,
    'Basic': 1,
    'Recruit': 0
  };

  return cadets.sort((a, b) => {
    // First sort by star level (highest to lowest)
    if (starOrder[a.starLevel] !== starOrder[b.starLevel]) {
      return starOrder[b.starLevel] - starOrder[a.starLevel];
    }
    
    // Then by rank (highest to lowest)
    if (rankOrder[a.rank] !== rankOrder[b.rank]) {
      return rankOrder[b.rank] - rankOrder[a.rank];
    }
    
    // Finally alphabetically by name
    return a.name.localeCompare(b.name);
  });
}

// Generate summary statistics
function generateSummary(cadets) {
  const total = cadets.length;
  const starLevels = ['4*', '3*', '2*', '1*', 'Basic', 'Recruit'];
  
  const counts = starLevels.reduce((acc, level) => {
    acc[level] = cadets.filter(cadet => cadet.starLevel === level).length;
    return acc;
  }, {});
  
  const percentages = {};
  starLevels.forEach(level => {
    percentages[level] = total > 0 ? Math.round((counts[level] / total) * 100) : 0;
  });

  return {
    total,
    counts,
    percentages
  };
}

// Generate Excel workbook
function generateExcelWorkbook(data) {
  const workbook = XLSX.utils.book_new();
  
  // Add summary sheet
  const summaryData = [
    ['Progress Tracker MK3 - Summary'],
    [],
    ['Total Cadets:', data.summary.total],
    [],
    ['Star Level', 'Count', 'Percentage'],
    ['4*', data.summary.counts['4*'], `${data.summary.percentages['4*']}%`],
    ['3*', data.summary.counts['3*'], `${data.summary.percentages['3*']}%`],
    ['2*', data.summary.counts['2*'], `${data.summary.percentages['2*']}%`],
    ['1*', data.summary.counts['1*'], `${data.summary.percentages['1*']}%`],
    ['Basic', data.summary.counts['Basic'], `${data.summary.percentages['Basic']}%`],
    ['Recruit', data.summary.counts['Recruit'], `${data.summary.percentages['Recruit']}%`]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Add main progress sheet
  const progressHeaders = [
    'Rank', 'Name', 'P-Number', 'Star Level', 
    'DT', 'SAA', 'SH', 'NAV', 'FC', 'FA', 'EXP', 
    'PHYS', 'CE', 'MK', 'JCIC', 'SCIC', 'AT', 'CIS'
  ];
  
  const progressData = [progressHeaders];
  
  data.cadets.forEach(cadet => {
    progressData.push([
      cadet.rank,
      cadet.name,
      cadet.pNumber,
      cadet.starLevel,
      cadet.achievements.DT,
      cadet.achievements.SAA,
      cadet.achievements.SH,
      cadet.achievements.NAV,
      cadet.achievements.FC,
      cadet.achievements.FA,
      cadet.achievements.EXP,
      cadet.achievements.PHYS,
      cadet.achievements.CE,
      cadet.achievements.MK,
      cadet.achievements.JCIC,
      cadet.achievements.SCIC,
      cadet.achievements.AT,
      cadet.achievements.CIS
    ]);
  });
  
  const progressSheet = XLSX.utils.aoa_to_sheet(progressData);
  XLSX.utils.book_append_sheet(workbook, progressSheet, 'Progress Tracker');
  
  // Add progression paths sheet
  const pathsHeaders = [
    'Rank', 'Name', 'Current Level', 'Next Level', 'Required Subjects'
  ];
  
  const pathsData = [pathsHeaders];
  
  data.cadets.forEach(cadet => {
    pathsData.push([
      cadet.rank,
      cadet.name,
      cadet.starLevel,
      cadet.progressionPath.nextLevel,
      cadet.progressionPath.requiredSubjects.join(', ')
    ]);
  });
  
  const pathsSheet = XLSX.utils.aoa_to_sheet(pathsData);
  XLSX.utils.book_append_sheet(workbook, pathsSheet, 'Progression Paths');
  
  // Apply styles (limited in xlsx library, but we can add comments for colors)
  // In a real implementation, we would use a more advanced Excel library for styling
  
  return workbook;
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`No files will be permanently stored on disk. All processing is done in memory.`);
});