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
      
      // Use the REACT_APP_API_URL environment variable if available, otherwise fall back to default URL
      const API_URL = process.env.REACT_APP_API_URL || 'https://mk3-progress-tracker-backend.onrender.com';
      
      const response = await axios.post(`${API_URL}/api/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("API response:", response.data); // For debugging
      onProcessed(
        response.data.data, 
        response.data.excelData, 
        response.data.fileInfo
      );
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
      
      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          disabled={!file}
          className={`px-4 py-2 rounded-md font-medium text-white flex items-center ${
            file ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Process & Generate
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mt-3">
        <p className="font-medium text-sm text-gray-700 mb-1">How to Get Your Cadet Data</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Log in to Westminster</li>
          <li>Go to: Personnel → Cadet Qualifications → ACF Star Awards</li>
          <li>Select: All Subjects (ACS)</li>
          <li>Click: Actions → Download → Download as CSV</li>
          <li>Upload: Drag and drop the CSV file here or click to browse</li>
        </ol>
        <p className="mt-2">That's it! The app will process your data and create a color-coded Excel report.</p>
      </div>
    </div>
  );
};

export default FileUpload;