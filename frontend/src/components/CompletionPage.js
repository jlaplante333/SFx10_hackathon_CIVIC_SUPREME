import React from 'react';
import './CompletionPage.css';
import EfficiencyDashboard from './EfficiencyDashboard';

const CompletionPage = ({ goals, decisions, totalTime }) => {
  // Always show 4/4 goals completed and 1000 score
  const completedGoals = goals; // Show all goals as completed
  const decisionsMade = Object.keys(decisions).length;
  const efficiencyScore = 1000; // Always 1000

  return (
    <div className="completion-page">
      <div className="completion-container">
        <div className="completion-header">
          <div className="celebration-icon">🎉</div>
          <h1>Congratulations on your meeting!</h1>
          <div className="efficiency-score">
            <span className="score-label">Efficiency Score:</span>
            <span className="score-value">{efficiencyScore}!!!</span>
          </div>
        </div>

        <div className="meeting-summary">
          <h2>📊 Meeting Summary</h2>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-label">Goals Completed:</span>
              <span className="stat-value">{completedGoals.length}/{goals.length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Decisions Made:</span>
              <span className="stat-value">{decisionsMade}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Meeting Time:</span>
              <span className="stat-value">{totalTime} minutes</span>
            </div>
          </div>
        </div>

        <div className="decisions-summary">
          <h2>📝 Key Decisions</h2>
          <div className="decisions-list">
            {goals.map((goal, index) => (
              <div key={goal.id} className={`decision-item completed`}>
                <div className="decision-header">
                  <span className="goal-number">{index + 1}</span>
                  <h3 className="goal-title">{goal.title}</h3>
                  <span className="completion-status">
                    ✅ Complete
                  </span>
                </div>
                {decisions[`goal_${index}`] && (
                  <div className="decision-content">
                    <p className="decision-text">{decisions[`goal_${index}`]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="completion-actions">
          <button 
            onClick={() => window.location.reload()} 
            className="restart-btn"
          >
            🚀 Start New Meeting
          </button>
        </div>
        <EfficiencyDashboard goals={goals} decisions={decisions} totalTime={totalTime} />
      </div>
    </div>
  );
};

export default CompletionPage; 