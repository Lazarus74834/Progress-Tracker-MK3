const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
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
    const { Readable } = require('stream');
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

// Clean up workbooks that are older than 15 minutes
function cleanupOldWorkbooks() {
  if (!app.locals.workbooks) return;
  
  const now = Date.now();
  Object.keys(app.locals.workbooks).forEach(key => {
    if (app.locals.workbooks[key].expiresAt < now) {
      delete app.locals.workbooks[key];
    }
  });
}

// New endpoint to download Excel file directly from memory
app.get('/api/excel', (req, res) => {
  const sessionId = req.query.session;
  
  console.log("Excel download request with session ID:", sessionId);
  console.log("Available workbooks:", Object.keys(app.locals.workbooks || {}));
  
  if (!sessionId) {
    console.error("No session ID provided");
    return res.status(400).json({ error: 'No session ID provided' });
  }
  
  if (!app.locals.workbooks) {
    console.error("No workbooks stored in app.locals");
    return res.status(404).json({ error: 'No workbooks available' });
  }
  
  if (!app.locals.workbooks[sessionId]) {
    console.error(`Workbook with session ID ${sessionId} not found`);
    return res.status(404).json({ error: 'Excel file not found or expired. Please process the data again.' });
  }
  
  try {
    console.log(`Retrieved workbook with session ID: ${sessionId}`);
    const { workbook } = app.locals.workbooks[sessionId];
    
    // Generate a formatted date for the filename
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `ACF_Progress_Report_${formattedDate}.xlsx`;
    
    // Set headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Write directly to the response
    console.log("Generating Excel buffer...");
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    console.log(`Generated Excel buffer of size: ${excelBuffer.length} bytes`);
    
    res.setHeader('Content-Length', excelBuffer.length);
    res.send(excelBuffer);
    
    console.log(`Successfully sent Excel file for session ID: ${sessionId}`);
    
    // Remove the workbook from memory after download
    delete app.locals.workbooks[sessionId];
    console.log(`Removed workbook from memory for session ID: ${sessionId}`);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).json({ error: 'Error generating Excel file' });
  }
});

// Subject name mapping with corrected acronyms
const subjectFullNames = {
  'DT': 'Drill and Turnout',
  'SAA': 'Skill at Arms',
  'SH': 'Shooting',
  'NAV': 'Navigation',
  'FC': 'Fieldcraft and Tactics',
  'FA': 'First Aid',
  'EXP': 'Expedition',
  'PHYS': 'Keeping Active (PE)',
  'CE': 'Community Engagement',
  'MK': 'Military Knowledge',
  'JCIC': 'Junior Cadet Instructor Cadre',
  'SCIC': 'Senior Cadet Instructor Cadre',
  'AT': 'Adventurous Training',
  'CIS': 'Communications and Information Systems'
};

// Process data for Excel output
function processDataForExcel(data) {
  // Extract cadets with rank, name, and achievements
  const cadets = data.map(row => {
    // Extract rank and name from the real data format
    const cadetField = row.Cadet || '';
    console.log("Processing cadet field:", cadetField);
    
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

    // Determine star level
    const starLevel = determineStarLevel(achievements);

    // Generate progression path
    const progressionPath = generateProgressionPath(achievements, starLevel);
    
    // Convert short subject names to full names in the required subjects list
    if (progressionPath && progressionPath.requiredSubjects) {
      // Check if the cadet needs all subjects for their current level
      const allSubjectsNeeded = (
        (starLevel === 'Recruit' && progressionPath.requiredSubjects.length === 8) ||
        (starLevel === 'Basic' && progressionPath.requiredSubjects.length === 11) ||
        (starLevel === '1*' && progressionPath.requiredSubjects.length === 9) ||
        (starLevel === '2*' && progressionPath.requiredSubjects.length >= 9) ||
        (starLevel === '3*' && progressionPath.requiredSubjects.length >= 7)
      );
      
      if (allSubjectsNeeded) {
        progressionPath.requiredSubjects = ["All subjects needed for advancement"];
      } else {
        progressionPath.requiredSubjects = progressionPath.requiredSubjects.map(subject => {
          return subjectFullNames[subject] || subject;
        });
      }
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

// Determine star level based on achievements
function determineStarLevel(achievements) {
  const hasAchievement = (subject, levels) => {
    if (!achievements[subject] || !achievements[subject].trim()) {
      return false;
    }
    return levels.some(level => achievements[subject].includes(level));
  };

  // Check for 4-Star - needs at least 2 subjects at 4* level
  const fourStarSubjects = Object.entries(achievements)
    .filter(([_, level]) => level && level.includes('4 Star'))
    .length;
  
  if (fourStarSubjects >= 2) {
    return '4*';
  }

  // Check for 3-Star
  const mandatoryFor3Star = ['DT', 'SAA', 'SH', 'FC', 'NAV', 'JCIC', 'AT'];
  const has3StarMandatory = mandatoryFor3Star.every(subject => 
    hasAchievement(subject, ['3 Star', '4 Star'])
  );
  
  const optionalSubjects = Object.keys(achievements)
    .filter(subject => !mandatoryFor3Star.includes(subject))
    .filter(subject => hasAchievement(subject, ['3 Star', '4 Star']));
  
  if (has3StarMandatory && optionalSubjects.length >= 2) {
    return '3*';
  }

  // Check for 2-Star
  const mandatoryFor2Star = ['DT', 'SAA', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'PHYS', 'CE'];
  const has2StarMandatory = mandatoryFor2Star.every(subject => 
    hasAchievement(subject, ['2 Star', '3 Star', '4 Star'])
  );
  
  if (has2StarMandatory) {
    return '2*';
  }

  // Check for 1-Star
  const mandatoryFor1Star = ['DT', 'SAA', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'CIS', 'PHYS', 'CE', 'AT'];
  const has1StarMandatory = mandatoryFor1Star.every(subject => 
    hasAchievement(subject, ['1 Star', '2 Star', '3 Star', '4 Star'])
  );
  
  if (has1StarMandatory) {
    return '1*';
  }

  // Check for Basic - 8 mandatory subjects at Basic or higher
  const mandatoryForBasic = ['DT', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'CIS', 'PHYS'];
  const hasBasicMandatory = mandatoryForBasic.every(subject => 
    hasAchievement(subject, ['Basic', '1 Star', '2 Star', '3 Star', '4 Star'])
  );
  
  if (hasBasicMandatory) {
    return 'Basic';
  }

  // Default to Recruit
  return 'Recruit';
}

// Generate progression path
function generateProgressionPath(achievements, currentStarLevel) {
  let nextLevel;
  let requiredSubjects = [];

  switch (currentStarLevel) {
    case 'Recruit':
      nextLevel = 'Basic';
      requiredSubjects = [
        'DT', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'CIS', 'PHYS'
      ].filter(subject => 
        !achievements[subject] || !['Basic', '1 Star', '2 Star', '3 Star', '4 Star'].some(level => 
          achievements[subject].includes(level)
        )
      );
      break;
    case 'Basic':
      nextLevel = '1*';
      requiredSubjects = [
        'DT', 'SAA', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'CIS', 'PHYS', 'CE', 'AT'
      ].filter(subject => 
        !achievements[subject] || !['1 Star', '2 Star', '3 Star', '4 Star'].some(level => 
          achievements[subject].includes(level)
        )
      );
      break;
    case '1*':
      nextLevel = '2*';
      requiredSubjects = [
        'DT', 'SAA', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'PHYS', 'CE'
      ].filter(subject => 
        !achievements[subject] || !['2 Star', '3 Star', '4 Star'].some(level => 
          achievements[subject].includes(level)
        )
      );
      break;
    case '2*':
      nextLevel = '3*';
      const mandatoryFor3Star = ['DT', 'SAA', 'SH', 'FC', 'NAV', 'JCIC', 'AT'];
      const missingMandatory = mandatoryFor3Star.filter(subject => 
        !achievements[subject] || !['3 Star', '4 Star'].some(level => 
          achievements[subject].includes(level)
        )
      );
      
      // Check for optionals - need at least 2 at 3* level
      const optionalSubjects = Object.keys(achievements)
        .filter(subject => !mandatoryFor3Star.includes(subject));
      
      const completedOptionals = optionalSubjects.filter(subject => 
        achievements[subject] && ['3 Star', '4 Star'].some(level => 
          achievements[subject].includes(level)
        )
      );
      
      requiredSubjects = [...missingMandatory];
      
      if (completedOptionals.length < 2) {
        // Add the most advanced optional subjects to the list
        const remainingOptionals = optionalSubjects
          .filter(subject => !completedOptionals.includes(subject))
          .sort((a, b) => {
            const aLevel = achievements[a] || '';
            const bLevel = achievements[b] || '';
            return bLevel.localeCompare(aLevel); // Sort by highest level achieved
          });
        
        requiredSubjects.push(...remainingOptionals.slice(0, 2 - completedOptionals.length));
      }
      break;
    case '3*':
      nextLevel = '4*';
      // Need at least 2 subjects at 4* level
      const completed4Star = Object.entries(achievements)
        .filter(([_, level]) => level && level.includes('4 Star'))
        .map(([subject, _]) => subject);
      
      if (completed4Star.length < 2) {
        // Prioritize subjects already at 3* level
        const possibleUpgrades = Object.entries(achievements)
          .filter(([_, level]) => level && level.includes('3 Star') && !level.includes('4 Star'))
          .map(([subject, _]) => subject);
        
        requiredSubjects = possibleUpgrades.slice(0, 2 - completed4Star.length);
      }
      break;
    case '4*':
      nextLevel = 'Master Cadet';
      requiredSubjects = ['Complete other requirements for Master Cadet qualification'];
      break;
    default:
      nextLevel = 'N/A';
      requiredSubjects = [];
  }

  return {
    nextLevel,
    requiredSubjects
  };
}

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

// Set up periodic cleanup (every 5 minutes)
setInterval(cleanupOldWorkbooks, 5 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`No files will be permanently stored on disk. All processing is done in memory.`);
});