import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ProgressTable from './components/ProgressTable';
import Summary from './components/Summary';

function App() {
  const [processedData, setProcessedData] = useState(null);
  const [downloadPath, setDownloadPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileProcessed = (data, downloadUrl) => {
    setProcessedData(data);
    setDownloadPath(downloadUrl);
    setLoading(false);
    setError('');
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-blue-600 py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Progress Tracker MK3
          </h1>
          <p className="text-white text-opacity-90">
            Army Cadet Force Progression Tracking System
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Cadet Data</h2>
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
                <h2 className="text-xl font-semibold mb-4">Progress Summary</h2>
                <Summary data={processedData} />
                
                {downloadPath && (
                  <div className="mt-6">
                    <a 
                      href={downloadPath} 
                      className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                      Download Excel Report
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4">Progress Preview</h2>
                <ProgressTable data={processedData} />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>Progress Tracker MK3 - Army Cadet Force Progression System</p>
        </div>
      </footer>
    </div>
  );
}

export default App;