import React from 'react';

const Summary = ({ data, showTrainingLevel }) => {
  // If data is not provided or is invalid, return empty component
  if (!data || !data.summary) {
    return <div className="text-gray-500">No summary data available</div>;
  }
  
  const summary = data.summary;
  
  // Check if we have the required data structure
  if (!summary.counts || !summary.percentages) {
    return <div className="text-gray-500">Invalid summary data format</div>;
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
  
  // Define the star levels based on the toggle
  const starLevels = showTrainingLevel 
    ? ['Master Cadet', '4*', '3*', '2*', '1*', 'Basic']
    : ['4*', '3*', '2*', '1*', 'Basic', 'Recruit'];
  const colorClasses = {
    'Master Cadet': 'bg-rose-100 border-rose-300',
    '4*': 'bg-rose-100 border-rose-300',
    '3*': 'bg-purple-100 border-purple-300',
    '2*': 'bg-blue-100 border-blue-300',
    '1*': 'bg-green-100 border-green-300',
    'Basic': 'bg-yellow-100 border-yellow-300',
    'Recruit': 'bg-slate-100 border-slate-300'
  };
  
  const textColorClasses = {
    'Master Cadet': 'text-rose-700',
    '4*': 'text-rose-700',
    '3*': 'text-purple-700',
    '2*': 'text-blue-700',
    '1*': 'text-green-700',
    'Basic': 'text-yellow-700',
    'Recruit': 'text-slate-700'
  };

  // Calculate the highest star level with at least one cadet
  const originalHighestLevel = ['4*', '3*', '2*', '1*', 'Basic', 'Recruit'].find(level => (summary.counts[level] || 0) > 0) || 'Recruit';
  const highestLevel = showTrainingLevel ? getTrainingLevel(originalHighestLevel) : originalHighestLevel;
  
  // Calculate the total number of recruits vs qualified cadets
  const recruits = summary.counts['Recruit'] || 0;
  const qualifiedCadets = summary.total - recruits;
  const qualifiedPercentage = summary.total > 0 ? Math.round((qualifiedCadets / summary.total) * 100) : 0;
  
  // Create a modified summary object for training levels if needed
  const displaySummary = showTrainingLevel ? {
    counts: {
      'Master Cadet': summary.counts['4*'] || 0,
      '4*': summary.counts['3*'] || 0,
      '3*': summary.counts['2*'] || 0,
      '2*': summary.counts['1*'] || 0,
      '1*': summary.counts['Basic'] || 0,
      'Basic': summary.counts['Recruit'] || 0
    },
    percentages: {
      'Master Cadet': summary.percentages['4*'] || 0,
      '4*': summary.percentages['3*'] || 0,
      '3*': summary.percentages['2*'] || 0,
      '2*': summary.percentages['1*'] || 0,
      '1*': summary.percentages['Basic'] || 0,
      'Basic': summary.percentages['Recruit'] || 0
    },
    total: summary.total
  } : summary;

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-gray-500 text-xs uppercase font-semibold">Total Cadets</h4>
          <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-gray-500 text-xs uppercase font-semibold">Qualified Cadets</h4>
          <p className="text-2xl font-bold text-gray-800">{qualifiedCadets} <span className="text-sm font-normal text-gray-500">({qualifiedPercentage}%)</span></p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-gray-500 text-xs uppercase font-semibold">Highest Level</h4>
          <p className={`text-2xl font-bold ${textColorClasses[highestLevel]}`}>{highestLevel}</p>
        </div>
        
        <div className={`p-4 rounded-lg shadow-sm border ${colorClasses[highestLevel]}`}>
          <h4 className="text-gray-500 text-xs uppercase font-semibold">Most Common</h4>
          <p className={`text-2xl font-bold ${textColorClasses[highestLevel]}`}>
            {starLevels.reduce((a, b) => (displaySummary.counts[a] || 0) > (displaySummary.counts[b] || 0) ? a : b)}
          </p>
        </div>
      </div>
      
      {/* Star Level Distribution Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            {showTrainingLevel ? 'Training Level Distribution' : 'Star Level Distribution'}
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              {starLevels.map(level => (
                <div key={level} className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-sm ${colorClasses[level]} mr-1`}></span>
                  <span className="text-xs font-medium">{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {showTrainingLevel ? 'Training Level' : 'Star Level'}
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Distribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {starLevels.map(level => {
              const count = displaySummary.counts[level] || 0;
              const percentage = displaySummary.percentages[level] || 0;
              
              return (
                <tr key={level} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className={`inline-block w-4 h-4 rounded-sm ${colorClasses[level]} mr-2`}></span>
                      <span className="font-medium text-gray-900">{level}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700 whitespace-nowrap">
                    {count} {count === 1 ? 'cadet' : 'cadets'}
                  </td>
                  <td className="px-4 py-3 relative">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-6">
                        <div 
                          className={`h-6 rounded-l-full transition-all duration-500 ease-in-out ${colorClasses[level].split(' ')[0]} flex items-center justify-end pr-2`} 
                          style={{ width: `${Math.max(percentage, 3)}%` }}
                        >
                          {percentage >= 10 && (
                            <span className="text-xs font-medium text-gray-800">{percentage}%</span>
                          )}
                        </div>
                      </div>
                      {percentage < 10 && (
                        <span className="ml-2 text-xs text-gray-700">{percentage}%</span>
                      )}
                      
                      {/* Tooltip on hover with more details */}
                      <div className="opacity-0 group-hover:opacity-100 absolute left-1/2 transform -translate-x-1/2 -translate-y-full top-2 bg-gray-800 text-white text-xs rounded p-2 pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {level} {showTrainingLevel ? 'Training' : ''}: {count} cadets ({percentage}% of total)
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Summary;