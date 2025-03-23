const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ storage });

// Process CSV and generate report
app.post('/api/process', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      try {
        // Process the data
        const processedData = processDataForExcel(results);
        
        // Generate Excel file
        const workbook = generateExcelWorkbook(processedData);
        
        const excelPath = path.join('uploads', `processed-${Date.now()}.xlsx`);
        XLSX.writeFile(workbook, excelPath);
        
        res.json({
          message: 'File processed successfully',
          data: processedData.summary,
          downloadPath: `/api/download/${path.basename(excelPath)}`
        });
      } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
      }
    });
});

// Download processed Excel file
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join('uploads', req.params.filename);
  res.download(filePath);
});

// Process data for Excel output
function processDataForExcel(data) {
  // Extract cadets with rank, name, and achievements
  const cadets = data.map(row => {
    // Extract rank and name
    const nameWithRank = row.Name || '';
    const rankMatch = nameWithRank.match(/Cadet\s+(LCpl|Cpl|Sgt|SSgt|CSM|RSM)?\s*(.*)/i);
    
    const rank = rankMatch && rankMatch[1] ? rankMatch[1] : '';
    const name = rankMatch ? rankMatch[2] : nameWithRank;

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

    return {
      rank,
      name,
      pNumber: row['P-Number'] || '',
      achievements,
      starLevel,
      progressionPath
    };
  });

  // Sort cadets by star level, rank, then name
  const sortedCadets = sortCadets(cadets);

  // Generate summary statistics
  const summary = generateSummary(sortedCadets);

  return {
    cadets: sortedCadets,
    summary
  };
}

// Determine star level based on achievements
function determineStarLevel(achievements) {
  // Check for 4-Star
  const fourStarSubjects = Object.entries(achievements)
    .filter(([_, level]) => level.includes('4*'))
    .length;
  
  if (fourStarSubjects >= 2) {
    return '4*';
  }

  // Check for 3-Star
  const mandatoryFor3Star = ['DT', 'SAA', 'SH', 'FC', 'NAV', 'JCIC', 'AT'];
  const has3StarMandatory = mandatoryFor3Star.every(subject => 
    achievements[subject] && ['3*', '4*'].some(level => achievements[subject].includes(level))
  );
  
  const optionalSubjects = Object.keys(achievements)
    .filter(subject => !mandatoryFor3Star.includes(subject))
    .filter(subject => 
      achievements[subject] && ['3*', '4*'].some(level => achievements[subject].includes(level))
    );
  
  if (has3StarMandatory && optionalSubjects.length >= 2) {
    return '3*';
  }

  // Check for 2-Star
  const mandatoryFor2Star = ['DT', 'SAA', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'PHYS', 'CE'];
  const has2StarMandatory = mandatoryFor2Star.every(subject => 
    achievements[subject] && ['2*', '3*', '4*'].some(level => achievements[subject].includes(level))
  );
  
  if (has2StarMandatory) {
    return '2*';
  }

  // Check for 1-Star
  const mandatoryFor1Star = ['DT', 'SAA', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'CIS', 'PHYS', 'CE', 'AT'];
  const has1StarMandatory = mandatoryFor1Star.every(subject => 
    achievements[subject] && ['1*', '2*', '3*', '4*'].some(level => achievements[subject].includes(level))
  );
  
  if (has1StarMandatory) {
    return '1*';
  }

  // Check for Basic
  const mandatoryForBasic = ['DT', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'CIS', 'PHYS'];
  const hasBasicMandatory = mandatoryForBasic.every(subject => 
    achievements[subject] && ['Basic', '1*', '2*', '3*', '4*'].some(level => achievements[subject].includes(level))
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
        !achievements[subject] || !['Basic', '1*', '2*', '3*', '4*'].some(level => 
          achievements[subject].includes(level)
        )
      );
      break;
    case 'Basic':
      nextLevel = '1*';
      requiredSubjects = [
        'DT', 'SAA', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'CIS', 'PHYS', 'CE', 'AT'
      ].filter(subject => 
        !achievements[subject] || !['1*', '2*', '3*', '4*'].some(level => 
          achievements[subject].includes(level)
        )
      );
      break;
    case '1*':
      nextLevel = '2*';
      requiredSubjects = [
        'DT', 'SAA', 'SH', 'FC', 'NAV', 'EXP', 'FA', 'PHYS', 'CE'
      ].filter(subject => 
        !achievements[subject] || !['2*', '3*', '4*'].some(level => 
          achievements[subject].includes(level)
        )
      );
      break;
    case '2*':
      nextLevel = '3*';
      const mandatoryFor3Star = ['DT', 'SAA', 'SH', 'FC', 'NAV', 'JCIC', 'AT'];
      const missingMandatory = mandatoryFor3Star.filter(subject => 
        !achievements[subject] || !['3*', '4*'].some(level => 
          achievements[subject].includes(level)
        )
      );
      
      // Check for optionals - need at least 2 at 3* level
      const optionalSubjects = Object.keys(achievements)
        .filter(subject => !mandatoryFor3Star.includes(subject));
      
      const completedOptionals = optionalSubjects.filter(subject => 
        achievements[subject] && ['3*', '4*'].some(level => 
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
        .filter(([_, level]) => level.includes('4*'))
        .map(([subject, _]) => subject);
      
      if (completed4Star.length < 2) {
        // Prioritize subjects already at 3* level
        const possibleUpgrades = Object.entries(achievements)
          .filter(([_, level]) => level.includes('3*') && !level.includes('4*'))
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
    'RSM': 6,
    'CSM': 5,
    'SSgt': 4,
    'Sgt': 3,
    'Cpl': 2,
    'LCpl': 1,
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
});