import React from 'react';

const ProgressTable = ({ data, showTrainingLevel }) => {
  // If data is not provided or is invalid, return empty component
  if (!data || !data.cadets) {
    return <div className="text-gray-500">No data available to display</div>;
  }

  // Function to convert achieved level to training level
  const getTrainingLevel = (achievedLevel) => {
    switch (achievedLevel) {
      case '4*':
        return 'Master Cadet';
      case '3*':
        return '4*';
      case '2*':
        return '3*';
      case '1*':
        return '2*';
      case 'Basic':
        return '1*';
      case 'Recruit':
        return 'Basic';
      default:
        return achievedLevel;
    }
  };

  // Define star level based background colors
  const getLevelColor = (starLevel) => {
    // If in training level mode, convert the achieved level to training level for color
    const levelToUse = showTrainingLevel ? getTrainingLevel(starLevel) : starLevel;
    
    switch (levelToUse) {
      case 'Master Cadet':
      case '4*':
        return 'bg-rose-100';
      case '3*':
        return 'bg-purple-100';
      case '2*':
        return 'bg-blue-100';
      case '1*':
        return 'bg-green-100';
      case 'Basic':
        return 'bg-yellow-100';
      default:
        return 'bg-slate-100';
    }
  };

  // Define subject level color coding
  const getSubjectColor = (level) => {
    if (!level) return '';
    if (level.includes('4 Star')) return 'bg-rose-100';
    if (level.includes('3 Star')) return 'bg-purple-100';
    if (level.includes('2 Star')) return 'bg-blue-100';
    if (level.includes('1 Star')) return 'bg-green-100';
    if (level.includes('Basic')) return 'bg-yellow-100';
    return '';
  };

  // Reorder subjects to move JCIC and SCIC to the end before the Next Steps column
  const subjects = ['DT', 'SAA', 'SH', 'NAV', 'FC', 'FA', 'EXP', 'PHYS', 'CE', 'MK', 'AT', 'CIS', 'JCIC', 'SCIC'];
  
  // Subject full names for tooltips
  const subjectFullNames = {
    'DT': 'Drill and Turnout',
    'SAA': 'Skill at Arms',
    'SH': 'Shooting',
    'NAV': 'Navigation',
    'FC': 'Fieldcraft and Tactics',
    'FA': 'First Aid',
    'EXP': 'Expedition',
    'PHYS': 'Keeping Active',
    'CE': 'Community Engagement',
    'MK': 'Military Knowledge',
    'JCIC': 'Junior Cadet Instructor Cadre',
    'SCIC': 'Senior Cadet Instructor Cadre',
    'AT': 'Adventurous Training',
    'CIS': 'Communications and Information Systems'
  };

  const getGroupedCadets = () => {
    // In training level mode, we need to group cadets by their training level
    const groups = showTrainingLevel 
      ? {
          'Master Cadet': [],
          '4*': [],
          '3*': [],
          '2*': [],
          '1*': [],
          'Basic': []
        }
      : {
          '4*': [],
          '3*': [],
          '2*': [],
          '1*': [],
          'Basic': [],
          'Recruit': []
        };

    // Fill groups with cadets
    data.cadets.forEach(cadet => {
      // Determine which level to use for grouping
      const groupLevel = showTrainingLevel 
        ? getTrainingLevel(cadet.starLevel)
        : cadet.starLevel;
      
      if (groups[groupLevel]) {
        groups[groupLevel].push({
          ...cadet,
          displayLevel: groupLevel // Add the display level to the cadet object
        });
      }
    });

    return groups;
  };

  const groupedCadets = getGroupedCadets();
  const starLevels = showTrainingLevel 
    ? ['Master Cadet', '4*', '3*', '2*', '1*', 'Basic']
    : ['4*', '3*', '2*', '1*', 'Basic', 'Recruit'];

  // Common header cell styles to ensure opacity is managed properly
  const headerBaseStyle = {
    backgroundColor: '#f9fafb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
    borderBottom: '2px solid #e5e7eb'
  };

  return (
    <div className="overflow-x-auto overflow-y-auto" style={{ position: 'relative', height: '100%', width: '100%' }}>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="sticky top-0 z-20" style={{ position: 'sticky', top: 0 }}>
          <tr>
            <th 
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10 w-16 border border-gray-300" 
              style={{ ...headerBaseStyle }}
            >
              Rank
            </th>
            <th 
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-16 z-10 w-40 border border-gray-300" 
              style={{ ...headerBaseStyle, borderRight: '3px solid #94a3b8' }}
            >
              Name
            </th>
            <th 
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 border border-gray-300 whitespace-nowrap" 
              style={{ ...headerBaseStyle }}
            >
              Star Level
            </th>
            {subjects.map(subject => (
              <th 
                key={subject} 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 border border-gray-300" 
                style={{ ...headerBaseStyle }} 
                title={subjectFullNames[subject] || subject}
              >
                {subject}
              </th>
            ))}
            <th 
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 border border-gray-300" 
              style={{ ...headerBaseStyle }}
            >
              Required Subjects
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {starLevels.map(level => (
            <React.Fragment key={level}>
              {groupedCadets[level].length > 0 && (
                <tr className="bg-gray-800 text-white" style={{ position: 'relative' }}>
                  <td colSpan={subjects.length + 4} className="px-3 py-2 text-sm font-semibold">
                    {showTrainingLevel ? `Training ${level}` : `${level} Achieved`} - {groupedCadets[level].length} Cadets
                  </td>
                </tr>
              )}
              {groupedCadets[level].map((cadet, index) => (
                <tr key={`${cadet.pNumber}-${index}`} className={`${getLevelColor(cadet.starLevel)} hover:bg-opacity-90`}>
                  <td 
                    className={`px-3 py-2 whitespace-nowrap text-sm text-gray-700 sticky left-0 z-10 ${getLevelColor(cadet.starLevel)} border border-gray-300`} 
                    style={{ backgroundColor: getLevelColor(cadet.starLevel).substring(3) }}
                  >
                    {cadet.rank}
                  </td>
                  <td 
                    className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-16 z-10 ${getLevelColor(cadet.starLevel)} border border-gray-300`} 
                    style={{ backgroundColor: getLevelColor(cadet.starLevel).substring(3), borderRight: '3px solid #94a3b8' }}
                  >
                    {cadet.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                    {showTrainingLevel ? 
                      `Training ${cadet.displayLevel}` : 
                      cadet.starLevel
                    }
                  </td>
                  
                  {subjects.map(subject => (
                    <td key={subject} className={`px-3 py-2 text-center text-sm text-gray-700 ${getSubjectColor(cadet.achievements[subject])} border border-gray-300`}>
                      {cadet.achievements[subject] || '-'}
                    </td>
                  ))}
                  
                  <td className="px-3 py-2 text-sm text-gray-700 border border-gray-300">
                    <div className="max-w-xs">
                      <p className="font-medium">
                        For {showTrainingLevel ? 
                          // If in training mode, show the next training level based on current training level
                          cadet.displayLevel === 'Master Cadet' ? 'Master Cadet' : getTrainingLevel(cadet.progressionPath.nextLevel) 
                          : cadet.progressionPath.nextLevel}:
                      </p>
                      {cadet.progressionPath.requiredSubjects.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          {cadet.progressionPath.requiredSubjects.join(', ')}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProgressTable;