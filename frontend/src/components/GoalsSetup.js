import React, { useState, useEffect } from 'react';
import './GoalsSetup.css';

const GoalsSetup = ({ onGoalsSubmit }) => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Problem Identification",
      complexity: 5,
      estimatedTime: 0.5, // 30 seconds = 0.5 minutes
      completed: false,
      goal: "Define the core meeting efficiency problem we're solving"
    },
    {
      id: 2,
      title: "Solution Architecture", 
      complexity: 8,
      estimatedTime: 0.5, // 30 seconds = 0.5 minutes
      completed: false,
      goal: "Explain how Huddle uses AI to maximize meeting efficiency and build consensus in real time"
    },
    {
      id: 3,
      title: "Feature Demonstration",
      complexity: 6,
      estimatedTime: 0.5, // 30 seconds = 0.5 minutes
      completed: false,
      goal: "Show key capabilities"
    },
    {
      id: 4,
      title: "Conclusion",
      complexity: 3,
      estimatedTime: 0.5, // 30 seconds = 0.5 minutes
      completed: false,
      goal: "Summarize and close"
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    complexity: 1,
    estimatedTime: 1
  });

  const [bufferBank, setBufferBank] = useState(1); // Default 1 minute buffer bank
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate totals
  const totalEstimatedTime = goals.reduce((sum, goal) => sum + goal.estimatedTime, 0);
  const totalTime = totalEstimatedTime + bufferBank;
  const completedGoals = goals.filter(goal => goal.completed);
  const remainingGoals = goals.filter(goal => !goal.completed);

  // Log when totals change
  useEffect(() => {
    console.log('Total time updated:', {
      totalEstimatedTime,
      bufferBank,
      totalTime,
      goalsCount: goals.length
    });
  }, [totalEstimatedTime, bufferBank, totalTime, goals.length]);

  // Test function to verify state updates
  const testStateUpdate = () => {
    console.log('Current goals state:', goals);
    console.log('Current totals:', { totalEstimatedTime, bufferBank, totalTime });
  };

  const addGoal = () => {
    if (newGoal.title.trim()) {
      setGoals([...goals, {
        id: Date.now(),
        ...newGoal,
        completed: false
      }]);
      setNewGoal({ title: '', complexity: 1, estimatedTime: 1 });
    }
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const updateGoalTime = (id, field, value) => {
    const numValue = field === 'estimatedTime' ? parseFloat(value) || 0 : parseInt(value) || 0;
    console.log(`Updating goal ${id}, field ${field} to ${numValue}`);
    
    setIsUpdating(true);
    
    setGoals(prevGoals => {
      const updatedGoals = prevGoals.map(goal => 
        goal.id === id ? { ...goal, [field]: numValue } : goal
      );
      
      // Log the updated goals for debugging
      console.log('Updated goals:', updatedGoals);
      
      return updatedGoals;
    });
    
    // Reset updating flag after a short delay
    setTimeout(() => setIsUpdating(false), 500);
  };

  const submitGoals = () => {
    if (goals.length > 0) {
      console.log('Submitting goals with buffer bank:', { goals, bufferBank });
      onGoalsSubmit(goals, bufferBank);
    }
  };

  const getComplexityColor = (complexity) => {
    if (complexity <= 3) return '#28a745'; // Green
    if (complexity <= 7) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  return (
    <div className="goals-setup-container">
      <div className="goals-setup-header">
        <h1>Huddle</h1>
        <p>Define your meeting agenda with goals, complexity, and time estimates</p>
      </div>
      
      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <h3>Total Goals</h3>
          <span className="stat-number">{goals.length}</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <h3>Total Time</h3>
          <span className={`stat-number ${isUpdating ? 'updating' : ''}`}>{totalTime} min</span>
          <span className="stat-detail">({totalEstimatedTime} estimated + {bufferBank} buffer bank)</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <h3>Avg Complexity</h3>
          <span className="stat-number">
            {goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.complexity, 0) / goals.length) : 0}
          </span>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Progress</h3>
          <span className="stat-number">{completedGoals.length}/{goals.length}</span>
        </div>
      </div>

      {/* Buffer Bank Settings */}
      <div className="buffer-bank-section">
        <h3>🏦 Buffer Bank Settings</h3>
        <div className="buffer-controls">
          <div className="buffer-input-group">
            <label>Buffer Bank Time (minutes):</label>
            <input
              type="number"
              min="0"
              value={bufferBank}
              onChange={(e) => setBufferBank(parseInt(e.target.value) || 0)}
              className="buffer-input"
            />
            <span className="buffer-description">
              This buffer time is available throughout the entire meeting for unexpected discussions or overruns.
            </span>
          </div>
        </div>
      </div>

      {/* Add New Goal */}
      <div className="add-goal-section">
        <h3>➕ Add New Goal</h3>
        <div className="add-goal-form">
          <input
            type="text"
            placeholder="Enter goal title..."
            value={newGoal.title}
            onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
            className="goal-input"
          />
          <div className="goal-inputs-row">
            <div className="input-group">
              <label>Complexity (1-10):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newGoal.complexity}
                onChange={(e) => setNewGoal({...newGoal, complexity: parseInt(e.target.value)})}
                className="goal-input-small"
              />
            </div>
            <div className="input-group">
              <label>Estimated Time (min):</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={newGoal.estimatedTime}
                onChange={(e) => setNewGoal({...newGoal, estimatedTime: parseFloat(e.target.value) || 0})}
                className="goal-input-small"
              />
            </div>
            <button onClick={addGoal} className="add-goal-btn">
              Add Goal
            </button>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="goals-list">
        <h3>📝 Meeting Goals</h3>
        {goals.map((goal, index) => (
          <div 
            key={goal.id} 
            className={`goal-item ${goal.completed ? 'completed' : ''}`}
          >
            <div className="goal-header">
              <div className="goal-number">{index + 1}</div>
              <div className="goal-content">
                <h4 
                  className={`goal-title ${goal.completed ? 'completed' : ''}`}
                  onClick={() => toggleGoal(goal.id)}
                >
                  {goal.title}
                </h4>
                {goal.goal && (
                  <p className="goal-description">
                    {goal.goal}
                  </p>
                )}
                <div className="goal-metrics">
                  <span 
                    className="complexity-badge"
                    style={{ backgroundColor: getComplexityColor(goal.complexity) }}
                  >
                    Complexity: {goal.complexity}
                  </span>
                  <span className="time-badge">
                    ⏱️ {goal.estimatedTime} min
                  </span>
                </div>
                <div className="goal-time-controls">
                  <div className="time-control-group">
                    <label>Est. Time:</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={goal.estimatedTime}
                      onChange={(e) => updateGoalTime(goal.id, 'estimatedTime', e.target.value)}
                      className="time-input"
                    />
                  </div>
                </div>
              </div>
              <div className="goal-actions">
                <button 
                  onClick={() => toggleGoal(goal.id)}
                  className={`toggle-btn ${goal.completed ? 'completed' : ''}`}
                >
                  {goal.completed ? '✓' : '○'}
                </button>
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="delete-btn"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Goals Button */}
      {goals.length > 0 && (
        <div className="submit-goals-section">
          <div className="submit-summary">
            <span className="summary-text">
              Ready to start meeting with <strong>{goals.length}</strong> goals
            </span>
            <span className="total-time-display">
              Total Time: <strong>{totalTime} minutes</strong>
              <span className="time-breakdown">
                ({totalEstimatedTime} estimated + {bufferBank} buffer bank)
              </span>
            </span>
          </div>
          <button onClick={submitGoals} className="submit-goals-btn">
            🚀 Start Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalsSetup; 