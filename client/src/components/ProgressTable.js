import React from 'react';

const ProgressTable = ({ data }) => {
  // Define star level based background colors
  const getLevelColor = (starLevel) => {
    switch (starLevel) {
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
    if (level.includes('4*')) return 'bg-rose-100';
    if (level.includes('3*')) return 'bg-purple-100';
    if (level.includes('2*')) return 'bg-blue-100';
    if (level.includes('1*')) return 'bg-green-100';
    if (level.includes('Basic')) return 'bg-yellow-100';
    return '';
  };

  const subjects = ['DT', 'SAA', 'SH', 'NAV', 'FC', 'FA', 'EXP', 'PHYS', 'CE', 'MK', 'JCIC', 'SCIC', 'AT', 'CIS'];

  const getGroupedCadets = () => {
    // Group cadets by star level
    const groups = {
      '4*': [],
      '3*': [],
      '2*': [],
      '1*': [],
      'Basic': [],
      'Recruit': []
    };

    // Fill groups with cadets
    data.cadets.forEach(cadet => {
      if (groups[cadet.starLevel]) {
        groups[cadet.starLevel].push(cadet);
      }
    });

    return groups;
  };

  const groupedCadets = getGroupedCadets();
  const starLevels = ['4*', '3*', '2*', '1*', 'Basic', 'Recruit'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P-Number</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
            {subjects.map(subject => (
              <th key={subject} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {subject}
              </th>
            ))}
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Steps</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {starLevels.map(level => (
            <React.Fragment key={level}>
              {groupedCadets[level].length > 0 && (
                <tr className="bg-gray-100">
                  <td colSpan={subjects.length + 5} className="px-3 py-2 text-sm font-semibold text-gray-700">
                    {level} Level - {groupedCadets[level].length} Cadets
                  </td>
                </tr>
              )}
              {groupedCadets[level].map((cadet, index) => (
                <tr key={`${cadet.pNumber}-${index}`} className={`${getLevelColor(cadet.starLevel)} hover:bg-opacity-80`}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{cadet.rank}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{cadet.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{cadet.pNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{cadet.starLevel}</td>
                  
                  {subjects.map(subject => (
                    <td key={subject} className={`px-3 py-2 text-center text-sm text-gray-700 ${getSubjectColor(cadet.achievements[subject])}`}>
                      {cadet.achievements[subject] || '-'}
                    </td>
                  ))}
                  
                  <td className="px-3 py-2 text-sm text-gray-700">
                    <div className="max-w-xs">
                      <p className="font-medium">Next: {cadet.progressionPath.nextLevel}</p>
                      {cadet.progressionPath.requiredSubjects.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Needs: {cadet.progressionPath.requiredSubjects.join(', ')}
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