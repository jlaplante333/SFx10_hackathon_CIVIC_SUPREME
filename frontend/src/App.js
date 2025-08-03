import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Recorder from './components/Recorder';
import TranscriptDisplay from './components/TranscriptDisplay';
import FeaturePanel from './components/FeaturePanel';
import DiagramViewer from './components/DiagramViewer';
import GoalsSetup from './components/GoalsSetup';
import MeetingProgress from './components/MeetingProgress';
import CompletionPage from './components/CompletionPage';
import SmartAssistant from './components/SmartAssistant';
import FAQ from './components/FAQ';
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
  const [currentPage, setCurrentPage] = useState('goals'); // 'goals', 'meeting', or 'completion'
  const [meetingGoals, setMeetingGoals] = useState([]);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [meetingStartTime, setMeetingStartTime] = useState(null);
  const [bufferBank, setBufferBank] = useState(0);
  const [decisions, setDecisions] = useState({});
  const [hasStopped, setHasStopped] = useState(false);

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
    setHasStopped(false);
    if (!meetingStartTime) {
      setMeetingStartTime(Date.now());
    }
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    setHasStopped(true);
    setCurrentPage('completion');
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
    
    // Scroll to top of the page when navigating to meeting page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  // Auto-start recording when navigating to meeting page
  useEffect(() => {
    if (currentPage === 'meeting' && !isRecording) {
      console.log('Auto-starting recording for meeting page');
      handleRecordingStart();
    }
  }, [currentPage, isRecording]);

  // Scroll to top when meeting page loads
  useEffect(() => {
    if (currentPage === 'meeting') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

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
  const handleAgendaItemComplete = async (completedGoalIndex) => {
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
    
    // Get the current transcript for this agenda item
    const currentTranscript = transcript;
    
    // Clear the transcript immediately so it starts fresh for the next agenda item
    console.log('Clearing transcript for next agenda item');
    setTranscript('');
    
    // Send transcript to OpenAI for analysis
    if (currentTranscript && currentTranscript.trim()) {
      console.log('Sending transcript to OpenAI for analysis:', currentTranscript);
      console.log('Transcript length:', currentTranscript.length);
      console.log('OpenAI API Key available:', !!process.env.REACT_APP_OPENAI_API_KEY);
      
      const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!openaiApiKey) {
        console.error('OpenAI API key not found in environment variables');
        return;
      }
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an AI assistant that analyzes meeting transcripts and extracts key decisions and takeaways. Provide concise, actionable insights.'
              },
              {
                role: 'user',
                content: `Analyze this meeting transcript for the agenda item "${completedGoal.title}". Extract the key decisions made, important takeaways, and any action items. Be concise and specific.\n\nTranscript:\n${currentTranscript}`
              }
            ],
            max_tokens: 300,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const analysis = data.choices[0].message.content;
          console.log('OpenAI analysis result:', analysis);
          
          // Update the decision for this goal
          setDecisions(prev => ({
            ...prev,
            [`goal_${completedGoalIndex}`]: analysis
          }));
        } else {
          console.error('OpenAI API error:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error calling OpenAI:', error);
      }
    } else {
      console.log('No transcript available to send to OpenAI');
    }
  };

  return (
    <div className="App">
      {currentPage === 'goals' ? (
        // Goals Setup Page
        <div className="goals-setup-page">
          <GoalsSetup onGoalsSubmit={handleGoalsSubmit} />
        </div>
      ) : currentPage === 'completion' ? (
        // Completion Page
        <CompletionPage 
          goals={meetingGoals}
          decisions={decisions}
          totalTime={meetingGoals.reduce((sum, goal) => sum + goal.estimatedTime, 0) + bufferBank}
        />
      ) : (
        // Meeting Page
        <>
          <header className="App-header">
            <h1>Civic Supreme</h1>
            <p>Your visionary companion for understanding and reimagining neighborhoods. Turn complex civic planning into beautiful, actionable knowledge.</p>
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
                hasStopped={hasStopped}
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
                decisions={decisions}
                setDecisions={setDecisions}
              />
              
              {/* Smart Assistant underneath FeaturePanel */}
              <SmartAssistant 
                transcript={transcript}
                currentGoalIndex={currentGoalIndex}
                goals={meetingGoals}
                isRecording={isRecording}
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

          {/* Feature Cards Section */}
          <div className="feature-cards-section">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <div className="feature-text">
                <h3>Interactive Maps</h3>
                <p>Visualize civic data</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗣️</div>
              <div className="feature-text">
                <h3>Community Voice</h3>
                <p>Amplify local voices</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h3>Meeting Insights</h3>
                <p>AI-powered analysis</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <div className="feature-text">
                <h3>Green Future</h3>
                <p>Sustainable planning</p>
              </div>
            </div>
          </div>

          {/* Beautiful FAQ Section */}
          <FAQ />
        </>
      )}
    </div>
  );
}

export default App; 