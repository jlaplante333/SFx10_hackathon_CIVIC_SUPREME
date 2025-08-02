import React, { useState, useEffect } from 'react';

const TranscriptDisplay = ({ transcript, onTranscriptUpdate, isRecording }) => {
  const [currentText, setCurrentText] = useState('');

  // Update display when transcript changes
  useEffect(() => {
    if (transcript) {
      setCurrentText(transcript);
    }
  }, [transcript]);

  const clearTranscript = () => {
    setCurrentText('');
    onTranscriptUpdate('');
  };

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <h3>Live Transcript</h3>
        <button
          onClick={clearTranscript}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Clear
        </button>
      </div>
      
      <div className={`transcript-content ${!currentText ? 'empty' : ''}`}>
        {currentText ? (
          <div>
            {currentText.split('.').map((sentence, index) => (
              <p key={index} style={{ marginBottom: '0.5rem' }}>
                {sentence.trim()}{sentence.trim() ? '.' : ''}
              </p>
            ))}
          </div>
        ) : (
          <div>
            {isRecording ? (
              <p>Listening for speech...</p>
            ) : (
              <p>No transcript available. Start recording to see the conversation here.</p>
            )}
          </div>
        )}
      </div>
      
      {isRecording && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          background: '#e3f2fd', 
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: '#1976d2'
        }}>
          🎤 Recording in progress - transcript will update in real-time
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay; 