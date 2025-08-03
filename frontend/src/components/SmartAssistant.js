import React, { useState, useEffect } from 'react';
import './SmartAssistant.css';

const SmartAssistant = ({ transcript, currentGoalIndex, goals, isRecording }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const currentGoal = goals[currentGoalIndex] || {};

  useEffect(() => {
    if (!transcript.trim() || !isRecording) return;

    // Only analyze every 15 seconds to avoid too many requests
    const now = Date.now();
    if (lastAnalysisTime && (now - lastAnalysisTime) < 15000) return;

    const analyzeWithMastra = async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch(`${backendUrl}/smart-assistant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: transcript,
            current_goal: currentGoal.title || '',
            meeting_context: {
              current_goal_index: currentGoalIndex,
              total_goals: goals.length,
              is_recording: isRecording
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setInsights(data.insights || []);
          setRecommendations(data.recommendations || []);
          setLastAnalysisTime(now);
        } else {
          console.error('Smart assistant request failed:', response.status);
          // Fallback to basic suggestions
          setSuggestions([
            "Consider summarizing key points discussed so far",
            "Ask for clarification on any unclear points",
            "Check if the current goal is being addressed effectively"
          ]);
        }
      } catch (error) {
        console.error('Error calling smart assistant:', error);
        // Fallback suggestions
        setSuggestions([
          "Keep the discussion focused on the current agenda item",
          "Consider time management for remaining topics",
          "Encourage participation from all team members"
        ]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeWithMastra();
  }, [transcript, currentGoalIndex, goals, isRecording, backendUrl, lastAnalysisTime, currentGoal.title]);

  return (
    <div className="smart-assistant">
      <h3>Smart Assistant</h3>
      
      {isAnalyzing && (
        <div className="analyzing-indicator">
          <div className="spinner"></div>
          <span>Analyzing meeting with Mastra AI...</span>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions-section">
          <h4>Suggestions</h4>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.length > 0 && (
        <div className="insights-section">
          <h4>Insights</h4>
          <ul className="insights-list">
            {insights.map((insight, index) => (
              <li key={index} className="insight-item">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>Recommendations</h4>
          <ul className="recommendations-list">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="recommendation-item">
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isAnalyzing && suggestions.length === 0 && insights.length === 0 && recommendations.length === 0 && (
        <div className="no-suggestions">
          <p>No suggestions available yet. Start speaking to get real-time Mastra AI insights.</p>
        </div>
      )}
    </div>
  );
};

export default SmartAssistant; 