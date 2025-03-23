import React from 'react';

const Summary = ({ data }) => {
  const starLevels = ['4*', '3*', '2*', '1*', 'Basic', 'Recruit'];
  const colorClasses = {
    '4*': 'bg-rose-100',
    '3*': 'bg-purple-100',
    '2*': 'bg-blue-100',
    '1*': 'bg-green-100',
    'Basic': 'bg-yellow-100',
    'Recruit': 'bg-slate-100'
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-medium text-gray-700">Total Cadets: {data.total}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Star Level
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {starLevels.map(level => (
                <tr key={level} className={colorClasses[level]}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {level}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {data.counts[level]}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {data.percentages[level]}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-center p-4">
          <div className="w-full h-48 relative">
            {starLevels.map((level, index) => {
              const percentage = data.percentages[level];
              const height = `${Math.max(5, percentage)}%`;
              
              return (
                <div key={level} className="absolute bottom-0 flex flex-col items-center" style={{
                  left: `${(index / starLevels.length) * 100}%`,
                  width: `${100 / starLevels.length}%`
                }}>
                  <div className={`w-full ${colorClasses[level]} rounded-t-sm transition-all duration-500 ease-in-out`} 
                       style={{ height }}>
                  </div>
                  <div className="text-xs mt-1 text-gray-700">{level}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;