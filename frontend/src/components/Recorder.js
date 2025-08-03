import React, { useState, useEffect } from 'react';

const Recorder = ({ isRecording, onRecordingStart, onRecordingStop, onTranscriptUpdate }) => {
  const [error, setError] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [hasStopped, setHasStopped] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          setLiveTranscript(prev => {
            const newTranscript = prev + ' ' + finalTranscript;
            console.log('Updated live transcript:', newTranscript);
            // Send to parent component with the updated transcript
            onTranscriptUpdate(newTranscript);
            return newTranscript;
          });
        }
        
        if (interimTranscript) {
          console.log('Interim transcript:', interimTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        if (isRecording && !hasStopped) {
          // Restart if still recording
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition not supported in this browser');
    }
  }, []);

  // Auto-start recording when isRecording prop becomes true
  useEffect(() => {
    if (isRecording && recognition && !hasStopped) {
      console.log('Auto-starting speech recognition');
      startRecording();
    }
  }, [isRecording, recognition, hasStopped]);

  const startRecording = async () => {
    try {
      setError('');
      setTranscriptionStatus('');
      setLiveTranscript('');
      setHasStopped(false);
      
      if (recognition) {
        recognition.start();
        setTranscriptionStatus('Recording... Speak clearly for live transcription');
        onRecordingStart();
      } else {
        setError('Speech recognition not available');
      }
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start speech recognition. Please check permissions.');
    }
  };

  const stopRecording = () => {
    console.log('stopRecording called');
    
    if (recognition) {
      try {
        recognition.stop();
        console.log('Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    setHasStopped(true);
    onRecordingStop();
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="recorder-container">
      <h3>Voice Recording</h3>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <span className={`status-indicator ${isRecording ? 'recording' : 'idle'}`}></span>
        <span>{isRecording ? 'Recording automatically...' : 'Ready to record'}</span>
      </div>
      
      <button
        className={`record-button ${isRecording ? 'recording' : ''} ${hasStopped ? 'stopped' : ''}`}
        onClick={handleRecordClick}
        disabled={!!error || hasStopped}
      >
        {hasStopped ? 'STOPPED RECORDING' : isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      {transcriptionStatus && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          background: '#e8f5e8', 
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: '#2d5a2d'
        }}>
          {transcriptionStatus}
        </div>
      )}
      
      {/* Live Transcript Display */}
      {isRecording && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: '#f8f9fa', 
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          maxHeight: '200px',
          overflowY: 'auto',
          fontSize: '0.9rem',
          color: '#495057'
        }}>
          <strong>Live Transcript:</strong>
          <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
            {liveTranscript || 'Listening for speech... (No transcription yet)'}
          </div>
        </div>
      )}
      
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6c757d' }}>
        {isRecording 
          ? 'Recording started automatically. Click "Stop Recording" when finished.'
          : 'Recording will start automatically when meeting begins.'
        }
      </p>
      
      {/* Debug info */}
      <div style={{ 
        marginTop: '0.5rem', 
        padding: '0.5rem', 
        background: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: '#6c757d'
      }}>
        Debug: Recording {isRecording ? 'ACTIVE' : 'INACTIVE'}, 
        Speech Recognition {recognition ? 'AVAILABLE' : 'NOT AVAILABLE'}
      </div>
    </div>
  );
};

export default Recorder; 