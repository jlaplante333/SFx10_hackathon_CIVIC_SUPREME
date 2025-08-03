import React from 'react';
import './EfficiencyDashboard.css';

const EfficiencyDashboard = ({ totalTime }) => {
  // Number of points in the time series
  const timePoints = 20;
  const times = Array.from({ length: timePoints }, (_, i) => (i / (timePoints - 1)) * (totalTime || 4));

  // Generate mock efficiency data: starts low, ends high
  const efficiencyData = times.map((t, i) => {
    // Simulate a smooth upward curve with a little noise
    const base = 200 + (i / (timePoints - 1)) * 800; // from 200 to 1000
    const noise = Math.random() * 40 - 20; // small random noise
    return Math.max(0, Math.round(base + noise));
  });

  // Generate mock productivity data: starts low, ends high
  const productivityData = times.map((t, i) => {
    const base = 20 + (i / (timePoints - 1)) * 80; // from 20% to 100%
    const noise = Math.random() * 5 - 2.5;
    return Math.max(0, Math.min(100, base + noise));
  });

  return (
    <div className="efficiency-dashboards">
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h3>📈 Meeting Efficiency Over Time</h3>
          <div className="chart-container">
            <div className="chart">
              {efficiencyData.map((efficiency, index) => (
                <div
                  key={index}
                  className="data-point"
                  style={{
                    left: `${(times[index] / times[times.length - 1]) * 100}%`,
                    bottom: `${(efficiency / 1000) * 100}%`,
                    opacity: 0.3 + (index / efficiencyData.length) * 0.7
                  }}
                />
              ))}
              <div className="chart-line">
                {efficiencyData.map((efficiency, index) => (
                  <div
                    key={index}
                    className="line-segment"
                    style={{
                      left: `${(times[index] / times[times.length - 1]) * 100}%`,
                      height: `${(efficiency / 1000) * 100}%`
                    }}
                  />
                ))}
              </div>
              <div className="chart-labels">
                <div className="y-label">Efficiency Score</div>
                <div className="x-label">Meeting Time (minutes)</div>
              </div>
            </div>
          </div>
          <div className="chart-stats">
            <div className="stat">
              <span className="stat-label">Peak Efficiency:</span>
              <span className="stat-value">{Math.max(...efficiencyData)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Average Efficiency:</span>
              <span className="stat-value">
                {Math.round(efficiencyData.reduce((sum, d) => sum + d, 0) / efficiencyData.length)}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>🚀 Productivity Velocity</h3>
          <div className="chart-container">
            <div className="chart">
              {productivityData.map((productivity, index) => (
                <div
                  key={index}
                  className="data-point productivity"
                  style={{
                    left: `${(times[index] / times[times.length - 1]) * 100}%`,
                    bottom: `${(productivity / 100) * 100}%`,
                    opacity: 0.3 + (index / productivityData.length) * 0.7
                  }}
                />
              ))}
              <div className="chart-line productivity-line">
                {productivityData.map((productivity, index) => (
                  <div
                    key={index}
                    className="line-segment productivity"
                    style={{
                      left: `${(times[index] / times[times.length - 1]) * 100}%`,
                      height: `${(productivity / 100) * 100}%`
                    }}
                  />
                ))}
              </div>
              <div className="chart-labels">
                <div className="y-label">Productivity %</div>
                <div className="x-label">Meeting Time (minutes)</div>
              </div>
            </div>
          </div>
          <div className="chart-stats">
            <div className="stat">
              <span className="stat-label">Peak Productivity:</span>
              <span className="stat-value">{Math.max(...productivityData).toFixed(1)}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Avg Productivity:</span>
              <span className="stat-value">
                {(productivityData.reduce((sum, d) => sum + d, 0) / productivityData.length).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyDashboard; 