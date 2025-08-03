import React, { useState, useEffect } from 'react';
import './FeaturePanel.css';

const FeaturePanel = ({ goals, currentGoalIndex, transcript, decisions, setDecisions }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTranscriptWithOpenAI = async (transcript, goalTitle) => {
    if (!transcript || !transcript.trim()) {
      return 'No transcript available for analysis.';
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
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
              content: `Analyze this meeting transcript for the agenda item "${goalTitle}". Extract the key decisions made, important takeaways, and any action items. Be concise and specific.\n\nTranscript:\n${transcript}`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      } else {
        console.error('OpenAI API error:', response.status, response.statusText);
        return 'Error analyzing transcript. Please try again.';
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return 'Error analyzing transcript. Please try again.';
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Remove automatic analysis effects - we only analyze when agenda items are complete
  // which is handled in App.js handleAgendaItemComplete

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