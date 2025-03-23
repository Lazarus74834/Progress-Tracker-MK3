import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUpload = ({ onProcessed, onError, onUploadStart }) => {
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) {
      onError('Please select a CSV file first');
      return;
    }

    try {
      onUploadStart();
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onProcessed(response.data.data, response.data.downloadPath);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Error processing file. Please check the file format.';
      onError(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center cursor-pointer transition duration-200 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        
        {file ? (
          <p className="text-sm text-gray-800 font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 font-medium">Drag & drop your CSV file here</p>
            <p className="text-xs text-gray-500 mt-1">or click to select a file</p>
          </>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        <p>Upload a CSV file with cadet data including:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Cadet names (with rank)</li>
          <li>P-Numbers</li>
          <li>Subject achievements (DT, SAA, SH, NAV, etc.)</li>
        </ul>
      </div>
      
      <button
        onClick={handleUpload}
        disabled={!file}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition duration-200 ${
          file ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Process & Generate Report
      </button>
    </div>
  );
};

export default FileUpload;