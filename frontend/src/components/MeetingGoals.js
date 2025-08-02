import React, { useState } from 'react';

const MeetingGoals = ({ onGoalsSubmit, onNavigateToMeeting }) => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Talk about design",
      complexity: 5,
      estimatedTime: 6,
      completed: false
    },
    {
      id: 2,
      title: "Decide about complexity analysis",
      complexity: 10,
      estimatedTime: 2,
      completed: false
    },
    {
      id: 3,
      title: "Decide about who to assign development to",
      complexity: 5,
      estimatedTime: 6,
      completed: false
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    complexity: 1,
    estimatedTime: 1
  });

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

  const submitGoals = () => {
    if (goals.length > 0) {
      onGoalsSubmit(goals);
      onNavigateToMeeting();
    }
  };

  const getComplexityColor = (complexity) => {
    if (complexity <= 3) return '#28a745'; // Green
    if (complexity <= 7) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const totalEstimatedTime = goals.reduce((sum, goal) => sum + goal.estimatedTime, 0);
  const completedGoals = goals.filter(goal => goal.completed);
  const remainingGoals = goals.filter(goal => !goal.completed);

  return (
    <div className="meeting-goals-container">
      <h2>Meeting Goals & Timeline</h2>
      
      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Goals</h3>
          <span className="stat-number">{goals.length}</span>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <span className="stat-number">{completedGoals.length}</span>
        </div>
        <div className="stat-card">
          <h3>Remaining</h3>
          <span className="stat-number">{remainingGoals.length}</span>
        </div>
        <div className="stat-card">
          <h3>Total Time</h3>
          <span className="stat-number">{totalEstimatedTime} min</span>
        </div>
      </div>

      {/* Add New Goal */}
      <div className="add-goal-section">
        <h3>Add New Goal</h3>
        <div className="add-goal-form">
          <input
            type="text"
            placeholder="Goal title..."
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
              <label>Time (minutes):</label>
              <input
                type="number"
                min="1"
                value={newGoal.estimatedTime}
                onChange={(e) => setNewGoal({...newGoal, estimatedTime: parseInt(e.target.value)})}
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
        <h3>Meeting Goals</h3>
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

      {/* Progress Bar */}
      {goals.length > 0 && (
        <div className="progress-section">
          <h3>Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(completedGoals.length / goals.length) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {completedGoals.length} of {goals.length} goals completed
          </span>
        </div>
      )}

      {/* Submit Goals Button */}
      {goals.length > 0 && (
        <div className="submit-goals-section">
          <button onClick={submitGoals} className="submit-goals-btn">
            Start Meeting with {goals.length} Goals ({totalEstimatedTime} min)
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingGoals; 