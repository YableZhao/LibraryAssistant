import React, { useRef } from 'react';

/**
 * Handles file selection and display of selected files
 */
const FileUpload = ({ selectedFiles, onFileSelect, onFileRemove, showUpload, config }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).filter(file => {
      const isValidType = config.allowedFileTypes.includes(file.type);
      const isValidSize = file.size <= config.maxFileSize;
      
      if (!isValidType) {
        alert(`File type ${file.type} is not supported`);
      }
      if (!isValidSize) {
        alert(`File ${file.name} is too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`);
      }
      
      return isValidType && isValidSize;
    });
    
    onFileSelect(files);
  };

  return (
    <div className={`file-upload-section ${showUpload ? 'show' : ''}`}>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        accept={config.allowedFileTypes.join(',')}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <div className="selected-files">
        {selectedFiles.map((file, index) => (
          <div key={index} className="selected-file">
            <span>{file.name}</span>
            <button onClick={() => onFileRemove(file)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;
