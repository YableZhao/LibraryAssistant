import React, { useState, useEffect } from 'react';
import './KnowledgeBase.css';

const KnowledgeBase = () => {
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); 
  const [isFileLoading, setIsFileLoading] = useState(false); 

  useEffect(() => {
    // Clear message after 5 seconds
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Predefined UT Library URLs for quick addition
  const predefinedUrls = [
    { name: 'UT Library About', url: 'https://www.lib.utexas.edu/about' },
    { name: 'UT Library Services', url: 'https://www.lib.utexas.edu/services' },
    { name: 'UT Study Spaces', url: 'https://www.lib.utexas.edu/study-spaces' },
    { name: 'UT Research Help', url: 'https://www.lib.utexas.edu/research-help' },
    { name: 'UT Collections', url: 'https://www.lib.utexas.edu/collections' }
  ];

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/rag/add-webpage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          text: `Successfully added ${data.count} chunks from ${url}`, 
          type: 'success' 
        });
        // Add to list of processed URLs
        setUrls([...urls, { url, count: data.count, date: new Date().toISOString() }]);
        setUrl('');
      } else {
        setMessage({ 
          text: `Error: ${data.error || 'Failed to add URL'}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: `Error: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for selecting a file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMessage({ text: '', type: '' }); // Clear previous messages
    }
  };

  // Handler for uploading the selected text file
  const handleAddTextFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ text: 'Please select a .txt file first', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('textFile', selectedFile); // Key must match multer config on backend

    try {
      setIsFileLoading(true);
      setMessage({ text: 'Uploading and processing file...', type: 'info' });
      const response = await fetch('http://localhost:5001/api/rag/add-textfile', {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed for FormData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: `Successfully added ${data.count} chunks from ${data.fileName}`, 
          type: 'success' 
        });
        // Optionally, add to a list of processed files if needed
        // setFiles([...files, { name: data.fileName, count: data.count, date: new Date().toISOString() }]);
        setSelectedFile(null); // Clear the file input
        // Reset file input element visually (requires ref or specific approach)
        if (document.getElementById('file-input')) {
          document.getElementById('file-input').value = '';
        }
      } else {
        setMessage({ 
          text: `Error: ${data.error || 'Failed to add file'}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: `Error: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleQuickAdd = async (predefinedUrl) => {
    setUrl(predefinedUrl.url);
    // We're not automatically submitting to allow user to review
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await fetch('http://localhost:5001/api/rag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery, limit: 5 }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.results || []);
        if (data.results.length === 0) {
          setMessage({ 
            text: 'No results found in knowledge base', 
            type: 'info' 
          });
        }
      } else {
        setMessage({ 
          text: `Error: ${data.error || 'Failed to search knowledge base'}`, 
          type: 'error' 
        });
        setSearchResults([]);
      }
    } catch (error) {
      setMessage({ 
        text: `Error: ${error.message}`, 
        type: 'error' 
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="knowledge-base-container">
      <h1>Knowledge Base Management</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="admin-section">
        <h2>Add Webpage to Knowledge Base</h2>
        <form onSubmit={handleAddUrl} className="url-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., https://www.lib.utexas.edu/about)"
            required
            className="url-input"
          />
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add URL'}
          </button>
        </form>
        
        <div className="quick-add-section">
          <h3>Quick Add UT Library Resources</h3>
          <div className="quick-add-buttons">
            {predefinedUrls.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickAdd(item)}
                className="quick-add-button"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h2>Add Text File to Knowledge Base</h2>
        <form onSubmit={handleAddTextFile} className="file-form">
          <input
            id="file-input" 
            type="file"
            onChange={handleFileChange}
            accept=".txt" 
            className="file-input"
          />
          <button 
            type="submit" 
            className="submit-button"
            disabled={!selectedFile || isFileLoading}
          >
            {isFileLoading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
        {selectedFile && <p className="selected-file">Selected: {selectedFile.name}</p>}
      </div>

      <div className="admin-section">
        <h2>Search Knowledge Base</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query (e.g., 'study spaces')"
            className="search-input"
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
        
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results</h3>
            {searchResults.map((result, index) => (
              <div key={index} className="search-result-item">
                <h4>Source: {new URL(result.source).hostname}</h4>
                <p className="result-content">{result.content}</p>
                <p className="result-meta">
                  <a href={result.source} target="_blank" rel="noopener noreferrer">
                    View Source
                  </a>
                  {result.addedAt && ` • Added: ${new Date(result.addedAt).toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {urls.length > 0 && (
        <div className="admin-section">
          <h2>Recent Additions</h2>
          <div className="recent-urls">
            {urls.map((item, index) => (
              <div key={index} className="url-item">
                <p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                </p>
                <p className="url-meta">
                  {item.count} chunks • Added: {new Date(item.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
