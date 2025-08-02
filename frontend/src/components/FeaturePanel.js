import React, { useState, useEffect } from 'react';
import './FeaturePanel.css';

const FeaturePanel = ({ goals, currentGoalIndex, transcript }) => {
  const [decisions, setDecisions] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // OpenAI API key from environment
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;

  // Function to analyze transcript with OpenAI
  const analyzeTranscriptWithOpenAI = async (transcript, goalTitle) => {
    if (!transcript || !transcript.trim()) {
      return "No transcript available for analysis.";
    }

    try {
      setIsAnalyzing(true);
      
      const prompt = `Analyze this meeting transcript and provide a concise decision or key takeaway for the agenda item "${goalTitle}". 
      
      Transcript: "${transcript}"
      
      Please provide a clear, actionable decision or conclusion that was reached during this agenda item. If no clear decision was made, summarize the main points discussed.
      
      Format your response as a brief, professional decision statement.`;

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
              content: 'You are a meeting assistant that extracts clear decisions and key takeaways from meeting transcripts.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        return "Unable to analyze transcript at this time.";
      }

      const data = await response.json();
      const analysis = data.choices[0]?.message?.content?.trim();
      
      return analysis || "No clear decision identified.";
      
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      return "Error analyzing transcript.";
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when agenda item changes and we have transcript
  useEffect(() => {
    if (currentGoalIndex >= 0 && currentGoalIndex < goals.length && transcript && transcript.trim()) {
      const currentGoal = goals[currentGoalIndex];
      const goalKey = `goal_${currentGoalIndex}`;
      
      // Only analyze if we don't already have a decision for this goal
      if (!decisions[goalKey]) {
        console.log(`Auto-analyzing transcript for agenda item: ${currentGoal.title}`);
        console.log('Transcript to analyze:', transcript);
        analyzeTranscriptWithOpenAI(transcript, currentGoal.title).then(analysis => {
          console.log('Analysis result:', analysis);
          setDecisions(prev => ({
            ...prev,
            [goalKey]: analysis
          }));
        });
      }
    }
  }, [currentGoalIndex, transcript, goals, decisions]);

  // New effect to handle agenda item completion
  useEffect(() => {
    // Check if any goals were just completed
    goals.forEach((goal, index) => {
      const goalKey = `goal_${index}`;
      
      // If goal is completed and we don't have a decision yet, analyze
      if (goal.completed && !decisions[goalKey] && transcript && transcript.trim()) {
        console.log(`Agenda item ${index} (${goal.title}) completed, analyzing transcript`);
        console.log('Transcript to analyze:', transcript);
        
        analyzeTranscriptWithOpenAI(transcript, goal.title).then(analysis => {
          console.log('Analysis result for completed item:', analysis);
          setDecisions(prev => ({
            ...prev,
            [goalKey]: analysis
          }));
        });
      }
    });
  }, [goals, transcript, decisions]);

  const handleDecisionChange = (goalIndex, value) => {
    const goalKey = `goal_${goalIndex}`;
    setDecisions(prev => ({
      ...prev,
      [goalKey]: value
    }));
  };

  const handleSaveDecision = (goalIndex) => {
    const goalKey = `goal_${goalIndex}`;
    console.log(`Decision saved for ${goals[goalIndex].title}:`, decisions[goalKey]);
    // You could add API call here to save to backend
  };

  const handleReanalyze = async (goalIndex) => {
    const currentGoal = goals[goalIndex];
    const goalKey = `goal_${goalIndex}`;
    
    console.log(`Re-analyzing transcript for: ${currentGoal.title}`);
    const analysis = await analyzeTranscriptWithOpenAI(transcript, currentGoal.title);
    
    setDecisions(prev => ({
      ...prev,
      [goalKey]: analysis
    }));
  };

  return (
    <div className="feature-panel">
      <h3>Decisions Made</h3>
      
      {isAnalyzing && (
        <div className="analyzing-indicator">
          🔄 Analyzing transcript with AI...
        </div>
      )}
      
      {goals.map((goal, index) => (
        <div key={goal.id} className={`decision-section ${index === currentGoalIndex ? 'current' : ''}`}>
          <div className="decision-header">
            <h4>{goal.title}</h4>
            {index === currentGoalIndex && (
              <span className="current-indicator">🔄 Current</span>
            )}
          </div>
          
          <div className="decision-content">
            <label>Decision/Result:</label>
            <textarea
              value={decisions[`goal_${index}`] || ''}
              onChange={(e) => handleDecisionChange(index, e.target.value)}
              placeholder="Capture the decision or result from this agenda item..."
              rows={3}
            />
            
            <div className="decision-actions">
              <button 
                onClick={() => handleSaveDecision(index)}
                className="save-btn"
              >
                Save Decision
              </button>
              
              <button 
                onClick={() => handleReanalyze(index)}
                className="reanalyze-btn"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Re-analyze with AI'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturePanel; 