import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ProgressTable from './components/ProgressTable';
import Summary from './components/Summary';

function App() {
  const [processedData, setProcessedData] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjectSummary, setSubjectSummary] = useState(null);
  const [showTrainingLevel, setShowTrainingLevel] = useState(false);

  const handleFileProcessed = (data, excelData, fileInfo) => {
    setProcessedData(data);
    setExcelData(excelData);
    setFileInfo(fileInfo);
    setLoading(false);
    setError('');
    
    // Generate subject summary
    generateSubjectSummary(data);
  };
  
  // Function to generate a summary of most needed subjects by star level
  const generateSubjectSummary = (data) => {
    if (!data || !data.cadets) return;
    
    // Initialize counters for each subject by star level based on achieved level
    // (this won't change when toggling views, since a cadet's needs remain the same)
    const subjectNeeds = {
      'Recruit': {},
      'Basic': {},
      '1*': {},
      '2*': {},
      '3*': {},
      '4*': {}
    };
    
    // Count needed subjects for each cadet's next star level
    data.cadets.forEach(cadet => {
      if (cadet.progressionPath && cadet.progressionPath.requiredSubjects) {
        // Always use the achieved star level for categorizing needed subjects
        const starLevel = cadet.starLevel;
        // Only include actual subjects, not generic messages
        cadet.progressionPath.requiredSubjects.forEach(subject => {
          if (!subject.includes('Complete other requirements') && 
              !subject.includes('All subjects needed')) { // Skip generic messages
            subjectNeeds[starLevel][subject] = (subjectNeeds[starLevel][subject] || 0) + 1;
          }
        });
      }
    });
    
    // Format the summary data
    const summary = Object.entries(subjectNeeds).map(([level, subjects]) => {
      // Sort all subjects by frequency (most needed first)
      const allSortedSubjects = Object.entries(subjects)
        .sort((a, b) => b[1] - a[1])
        .map(([subject, count]) => ({ subject, count }));
      
      // Get just the top 3 for display
      const top3Subjects = allSortedSubjects.slice(0, 3);
      
      // Store total count of subjects needed
      const totalSubjectsNeeded = allSortedSubjects.length;
      
      return {
        level,
        subjects: top3Subjects,
        totalSubjectsNeeded,
        allSubjects: allSortedSubjects
      };
    })
    .filter(item => item.subjects.length > 0) // Only include levels with needed subjects
    // Sort by star level (highest first) using a custom sort function
    .sort((a, b) => {
      const starOrder = {
        '4*': 5,
        '3*': 4, 
        '2*': 3,
        '1*': 2,
        'Basic': 1,
        'Recruit': 0
      };
      return starOrder[b.level] - starOrder[a.level];
    });
    
    setSubjectSummary(summary);
  };

  const handleError = (message) => {
    setError(message);
    setLoading(false);
  };

  const handleUploadStart = () => {
    setLoading(true);
    setError('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white py-4 shadow-md border-b border-gray-200">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={`${process.env.PUBLIC_URL}/images/Army-Cadets-logo.jpg`}
                alt="Army Cadets Logo" 
                className="h-14 object-contain"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Progress Tracker MK3
                </h1>
                <p className="text-gray-600">
                  Army Cadet Force Progression Tracking System
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto max-w-7xl px-4 py-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Cadet Data</h2>
              
              {/* Download button placed next to upload heading */}
              {excelData && fileInfo && (
                <button 
                  onClick={() => {
                    // Create a blob from the base64 data
                    const byteCharacters = atob(excelData);
                    const byteArrays = [];
                    for (let i = 0; i < byteCharacters.length; i++) {
                      byteArrays.push(byteCharacters.charCodeAt(i));
                    }
                    const byteArray = new Uint8Array(byteArrays);
                    const blob = new Blob([byteArray], { type: fileInfo.type });
                    
                    // Create a download link and trigger it
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileInfo.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Excel
                </button>
              )}
            </div>
            
            <FileUpload 
              onProcessed={handleFileProcessed} 
              onError={handleError}
              onUploadStart={handleUploadStart}
            />
            
            {loading && (
              <div className="text-center mt-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Processing data...</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>

          {processedData && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Progress Summary</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Achieved Level</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={showTrainingLevel}
                        onChange={() => setShowTrainingLevel(!showTrainingLevel)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="text-sm text-gray-600">Training Level</span>
                  </div>
                </div>
                <Summary data={processedData} showTrainingLevel={showTrainingLevel} />
                
                {/* Subject Needs Summary */}
                {subjectSummary && subjectSummary.length > 0 && (
                  <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      Top 3 Most Needed Subjects by Training Level
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {subjectSummary.map((level) => {
                        // Get the color class for this star level
                        const colorClass = level.level === '4*' ? 'bg-rose-50 border-rose-200' :
                                          level.level === '3*' ? 'bg-purple-50 border-purple-200' :
                                          level.level === '2*' ? 'bg-blue-50 border-blue-200' :
                                          level.level === '1*' ? 'bg-green-50 border-green-200' :
                                          level.level === 'Basic' ? 'bg-yellow-50 border-yellow-200' :
                                          'bg-slate-50 border-slate-200';
                        
                        const textColor = level.level === '4*' ? 'text-rose-700' :
                                         level.level === '3*' ? 'text-purple-700' :
                                         level.level === '2*' ? 'text-blue-700' :
                                         level.level === '1*' ? 'text-green-700' :
                                         level.level === 'Basic' ? 'text-yellow-700' :
                                         'text-slate-700';
                        
                        const trainingLevel = level.level === 'Recruit' ? 'Basic' :
                                           level.level === 'Basic' ? '1*' :
                                           level.level === '1*' ? '2*' :
                                           level.level === '2*' ? '3*' :
                                           level.level === '3*' ? '4*' :
                                           level.level === '4*' ? 'Master Cadet' : level.level;
                        
                        return (
                          <div key={level.level} className={`p-4 rounded-lg ${colorClass} border`}>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className={`font-medium ${textColor}`}>
                                Training {trainingLevel} Cadets Need:
                              </h4>
                              <span className="text-xs text-gray-500">
                                {level.totalSubjectsNeeded > 3 ? 
                                  `Showing top 3 of ${level.totalSubjectsNeeded} subjects` : 
                                  `${level.totalSubjectsNeeded} subject${level.totalSubjectsNeeded !== 1 ? 's' : ''} needed`}
                              </span>
                            </div>
                            
                            {level.subjects.length > 0 ? (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                  {level.subjects.map((item, index) => (
                                    <div key={index} className="bg-white p-3 rounded-md border shadow-sm">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-800 mb-1">{item.subject}</span>
                                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full self-start">
                                          {item.count} cadet{item.count !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {level.totalSubjectsNeeded > 3 && (
                                  <details className="text-sm text-gray-600 mt-2">
                                    <summary className="cursor-pointer font-medium hover:text-gray-800">
                                      Show all {level.totalSubjectsNeeded} subjects needed
                                    </summary>
                                    <div className="mt-3 pl-3 border-l-2 border-gray-300">
                                      <ul className="space-y-1">
                                        {level.allSubjects.map((item, idx) => (
                                          <li key={idx} className="flex justify-between">
                                            <span>{item.subject}</span>
                                            <span className="text-gray-500">{item.count} cadet{item.count !== 1 ? 's' : ''}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </details>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-gray-500">No subjects needed</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md mb-4 p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Progress Preview</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Achieved Level</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={showTrainingLevel}
                          onChange={() => setShowTrainingLevel(!showTrainingLevel)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className="text-sm text-gray-600">Training Level</span>
                    </div>
                    <button 
                      onClick={() => {
                        const element = document.getElementById('progress-table-container');
                        if (element) {
                          if (!document.fullscreenElement) {
                            element.requestFullscreen().catch(err => {
                              console.error(`Error attempting to enable fullscreen: ${err.message}`);
                            });
                          } else {
                            document.exitFullscreen();
                          }
                        }
                      }}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                      Fullscreen
                    </button>
                  </div>
                </div>
              </div>
              
              <div id="progress-table-container" className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: 'calc(100vw - 32px)', margin: '0 auto', maxWidth: '100%', height: 'calc(100vh - 400px)', minHeight: '500px' }}>
                <ProgressTable data={processedData} showTrainingLevel={showTrainingLevel} />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-3 md:mb-0">
              <p className="text-center md:text-left">
                Progress Tracker MK3 - Army Cadet Force Progression System
              </p>
            </div>
            <div className="text-sm text-gray-300 text-center md:text-right">
              <p>Created by SSI Jacob Berry</p>
              <p>Chelmsford Detachment Commander, B (EY) Company, Essex ACF</p>
              <p className="mt-2">&copy; {new Date().getFullYear()} Army Cadet Force. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;