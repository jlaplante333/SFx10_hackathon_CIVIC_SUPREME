import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './MeetingProgress.css';

const MeetingProgress = ({ 
  goals, 
  currentGoalIndex, 
  onGoalComplete, 
  meetingStartTime, 
  onCurrentGoalChange,
  bufferBank,
  onGoalTimeExtension,
  onAgendaItemComplete // New prop for when agenda item completes
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showTimeExtensionPopup, setShowTimeExtensionPopup] = useState(false);
  const [currentGoalElapsedTime, setCurrentGoalElapsedTime] = useState(0);
  const [popupStartTime, setPopupStartTime] = useState(null);
  const [totalTimeExtensions, setTotalTimeExtensions] = useState(0);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check and update current goal based on time
  useEffect(() => {
    if (!meetingStartTime || goals.length === 0) return;

    const elapsedMinutes = (currentTime - meetingStartTime) / (1000 * 60);
    let cumulativeTime = 0;
    let newGoalIndex = 0;

    // Find the appropriate goal based on elapsed time
    for (let i = 0; i < goals.length; i++) {
      const goalTime = goals[i].estimatedTime;
      const goalStartMinutes = cumulativeTime;
      const goalEndMinutes = cumulativeTime + goalTime;

      if (elapsedMinutes >= goalStartMinutes && elapsedMinutes < goalEndMinutes) {
        newGoalIndex = i;
        break;
      }

      cumulativeTime += goalTime;
    }

    // If we've passed all goals, set to the last one
    if (elapsedMinutes >= cumulativeTime) {
      newGoalIndex = goals.length - 1;
    }

    // Only trigger change if goal actually changed
    if (newGoalIndex !== currentGoalIndex) {
      console.log(`Goal changed from ${currentGoalIndex} to ${newGoalIndex}`);
      
      // Mark previous goal as complete if it exists
      if (currentGoalIndex >= 0 && currentGoalIndex < goals.length) {
        console.log(`Marking goal ${currentGoalIndex} as complete`);
        onGoalComplete(goals[currentGoalIndex].id);
        
        // Trigger OpenAI analysis for the completed agenda item
        if (onAgendaItemComplete) {
          onAgendaItemComplete(currentGoalIndex);
        }
      }
      
      onCurrentGoalChange(newGoalIndex);
    }
  }, [currentTime, meetingStartTime, goals, currentGoalIndex, onCurrentGoalChange, onGoalComplete, onAgendaItemComplete]);

  // Calculate time left for current goal
  const getTimeLeftForCurrentGoal = () => {
    if (!meetingStartTime || currentGoalIndex < 0 || currentGoalIndex >= goals.length) return 0;

    const elapsedMinutes = (currentTime - meetingStartTime) / (1000 * 60);
    let cumulativeTime = 0;

    // Calculate start time of current goal
    for (let i = 0; i < currentGoalIndex; i++) {
      cumulativeTime += goals[i].estimatedTime;
    }

    const goalStartMinutes = cumulativeTime;
    const goalEndMinutes = goalStartMinutes + goals[currentGoalIndex].estimatedTime;
    const timeLeft = goalEndMinutes - elapsedMinutes;

    return Math.max(0, timeLeft);
  };

  // Show popup when 1 minute left
  useEffect(() => {
    const timeLeft = getTimeLeftForCurrentGoal();
    
    if (timeLeft <= 1 && timeLeft > 0 && !showTimeExtensionPopup) {
      setShowTimeExtensionPopup(true);
      setPopupStartTime(Date.now());
    }
  }, [currentTime, currentGoalIndex, goals, meetingStartTime, showTimeExtensionPopup]);

  // Auto-close popup after 1 minute
  useEffect(() => {
    if (showTimeExtensionPopup && popupStartTime) {
      const timeout = setTimeout(() => {
        handleTimeExtension(true); // Default to "More Time"
      }, 60000); // 1 minute

      return () => clearTimeout(timeout);
    }
  }, [showTimeExtensionPopup, popupStartTime]);

  const handleTimeExtension = (extend) => {
    setShowTimeExtensionPopup(false);
    setPopupStartTime(null);
    
    if (extend && onGoalTimeExtension) {
      onGoalTimeExtension(currentGoalIndex, 1); // Add 1 minute
      setTotalTimeExtensions(prev => prev + 1);
    }
  };

  const getGoalStartTime = (goalIndex) => {
    if (!meetingStartTime) return null;
    
    let cumulativeTime = 0;
    for (let i = 0; i < goalIndex; i++) {
      cumulativeTime += goals[i].estimatedTime;
    }
    cumulativeTime += totalTimeExtensions; // Add accumulated time extensions
    
    const startTime = new Date(meetingStartTime + (cumulativeTime * 60 * 1000));
    return startTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!meetingStartTime || goals.length === 0) {
    return (
      <div className="meeting-progress">
        <h3>📊 Meeting Agenda</h3>
        <p>Meeting not started yet.</p>
      </div>
    );
  }

  const currentTimeString = new Date(currentTime).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <div className="meeting-progress">
      <h3>📊 Meeting Agenda</h3>
      
      <div className="meeting-time">
        <span className="time-label">Meeting Time:</span>
        <span className="time-value">{currentTimeString}</span>
      </div>
      
      <div className="buffer-bank-display">
        Buffer Bank: {bufferBank} minute{bufferBank !== 1 ? 's' : ''}
      </div>
      
      <div className="goals-list">
        {goals.map((goal, index) => (
          <div 
            key={goal.id} 
            className={`goal-mini-item ${index === currentGoalIndex ? 'current' : ''} ${goal.completed ? 'completed' : ''}`}
          >
            <div className="goal-mini-header">
              <span className="goal-mini-number">{index + 1}</span>
              <span className="goal-mini-title">{goal.title}</span>
              <span className="goal-mini-time">{goal.estimatedTime}m</span>
              {getGoalStartTime(index) && (
                <span className="goal-mini-scheduled">{getGoalStartTime(index)}</span>
              )}
            </div>
            {goal.completed && (
              <div className="goal-completed-indicator">✅ Complete</div>
            )}
          </div>
        ))}
      </div>

      {/* Time Extension Popup */}
      {showTimeExtensionPopup && createPortal(
        <div className="time-extension-popup-overlay">
          <div className="time-extension-popup">
            <div className="popup-header">
              <h3>⏰ Time Alert</h3>
            </div>
            <div className="popup-content">
              <p className="popup-question">You have 1 minute remaining</p>
            </div>
            <div className="popup-actions">
              <button onClick={() => handleTimeExtension(false)} className="popup-btn decide-btn">
                Decide
              </button>
              <button onClick={() => handleTimeExtension(true)} className="popup-btn more-time-btn">
                More Time
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MeetingProgress; 