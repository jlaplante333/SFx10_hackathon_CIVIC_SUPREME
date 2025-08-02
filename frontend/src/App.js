import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Recorder from './components/Recorder';
import TranscriptDisplay from './components/TranscriptDisplay';
import FeaturePanel from './components/FeaturePanel';
import DiagramViewer from './components/DiagramViewer';
import GoalsSetup from './components/GoalsSetup';
import MeetingProgress from './components/MeetingProgress';
import './components/GoalsSetup.css';
import './components/MeetingProgress.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [diagram, setDiagram] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState('goals'); // 'goals' or 'meeting'
  const [meetingGoals, setMeetingGoals] = useState([]);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [meetingStartTime, setMeetingStartTime] = useState(null);
  const [bufferBank, setBufferBank] = useState(0);

  // Environment variable for backend URL
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const pollingInterval = parseInt(process.env.REACT_APP_POLLING_INTERVAL) || 8000;

  const fetchAnalysis = useCallback(async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/vapi-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary || '');
      setDiagram(data.diagram || '');
      setTasks(data.tasks || []);
      
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to analyze transcript. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [transcript, backendUrl]);

  // Polling effect when recording
  useEffect(() => {
    if (!isRecording && transcript.trim()) {
      const interval = setInterval(() => {
        fetchAnalysis();
      }, pollingInterval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [isRecording, transcript, fetchAnalysis, pollingInterval]);

  const handleRecordingStart = () => {
    setIsRecording(true);
    setTranscript('');
    setSummary('');
    setDiagram('');
    setTasks([]);
    setError('');
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    // Fetch analysis immediately when recording stops
    if (transcript.trim()) {
      fetchAnalysis();
    }
  };

  const handleTranscriptUpdate = (newTranscript) => {
    setTranscript(newTranscript);
  };

  const handleGoalsSubmit = (goals, bufferBank) => {
    console.log('App.js received goals with buffer bank:', { goals, bufferBank });
    setMeetingGoals(goals);
    setBufferBank(bufferBank);
    setCurrentGoalIndex(0);
    setMeetingStartTime(Date.now());
    setCurrentPage('meeting'); // Automatically navigate to meeting page
  };

  // Auto-start recording when navigating to meeting page
  useEffect(() => {
    if (currentPage === 'meeting' && !isRecording) {
      console.log('Auto-starting recording for meeting page');
      handleRecordingStart();
    }
  }, [currentPage, isRecording]);

  const handleNavigateToMeeting = () => {
    setCurrentPage('voice');
  };

  // Handle current goal change
  const handleCurrentGoalChange = (newGoalIndex) => {
    console.log(`App.js: Goal changed from ${currentGoalIndex} to ${newGoalIndex}`);
    setCurrentGoalIndex(newGoalIndex);
  };

  // Handle goal time extension
  const handleGoalTimeExtension = (goalIndex, additionalMinutes = 5) => {
    setMeetingGoals(prevGoals => 
      prevGoals.map((goal, index) => 
        index === goalIndex 
          ? { ...goal, estimatedTime: goal.estimatedTime + additionalMinutes }
          : goal
      )
    );
    console.log(`Extended goal ${goalIndex + 1} by ${additionalMinutes} minutes`);
  };

  // Handle goal completion
  const handleGoalComplete = (goalId) => {
    setMeetingGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  // Handle agenda item completion and trigger OpenAI analysis
  const handleAgendaItemComplete = (completedGoalIndex) => {
    console.log(`Agenda item ${completedGoalIndex} completed, triggering OpenAI analysis`);
    
    // Mark the goal as complete
    const completedGoal = meetingGoals[completedGoalIndex];
    if (completedGoal) {
      setMeetingGoals(prevGoals => 
        prevGoals.map((goal, index) => 
          index === completedGoalIndex ? { ...goal, completed: true } : goal
        )
      );
    }
    
    // The FeaturePanel will automatically analyze the transcript when the goal changes
    // because it's listening to currentGoalIndex changes
  };

  return (
    <div className="App">
      {currentPage === 'goals' ? (
        // Goals Setup Page
        <div className="goals-setup-page">
          <GoalsSetup onGoalsSubmit={handleGoalsSubmit} />
        </div>
      ) : (
        // Meeting Page
        <>
          <header className="App-header">
            <h1>Huddle</h1>
            <p>Record, transcribe, and analyze engineering discussions</p>
          </header>

          <main className="App-main">
            <div className="left-panel">
              {/* Meeting Progress */}
              {meetingGoals.length > 0 && (
                <MeetingProgress 
                  goals={meetingGoals} 
                  currentGoalIndex={currentGoalIndex}
                  onGoalComplete={handleGoalComplete}
                  meetingStartTime={meetingStartTime}
                  onCurrentGoalChange={handleCurrentGoalChange}
                  bufferBank={bufferBank}
                  onGoalTimeExtension={handleGoalTimeExtension}
                  onAgendaItemComplete={handleAgendaItemComplete}
                />
              )}
              
              <Recorder 
                isRecording={isRecording}
                onRecordingStart={handleRecordingStart}
                onRecordingStop={handleRecordingStop}
                onTranscriptUpdate={handleTranscriptUpdate}
              />
              
              <TranscriptDisplay 
                transcript={transcript}
                onTranscriptUpdate={handleTranscriptUpdate}
                isRecording={isRecording}
              />
            </div>

            <div className="right-panel">
              <FeaturePanel 
                goals={meetingGoals} 
                currentGoalIndex={currentGoalIndex}
                transcript={transcript}
              />
              
              <div className="analysis-section">
                {summary && (
                  <div className="summary-section">
                    <h3>Meeting Summary</h3>
                    <p>{summary}</p>
                  </div>
                )}
                
                {diagram && (
                  <DiagramViewer diagram={diagram} />
                )}
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default App; 