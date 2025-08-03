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
  const [popupShownForGoal, setPopupShownForGoal] = useState(null); // Track which goal has shown popup

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check and update current goal based on time - GO SEQUENTIALLY
  useEffect(() => {
    if (!meetingStartTime || goals.length === 0) return;

    const elapsedMinutes = (currentTime - meetingStartTime) / (1000 * 60);
    
    console.log(`Time check - Elapsed: ${elapsedMinutes.toFixed(2)} minutes, Current goal: ${currentGoalIndex}`);
    
    // Check if it's time to move to the next goal
    for (let i = 0; i < goals.length - 1; i++) {
      let cumulativeTime = 0;
      
      // Calculate cumulative time up to the NEXT goal (i + 1)
      for (let j = 0; j <= i; j++) {
        cumulativeTime += goals[j].estimatedTime;
      }
      cumulativeTime += totalTimeExtensions;
      
      console.log(`Goal ${i + 1} should start at: ${cumulativeTime.toFixed(2)} minutes (cumulative: ${cumulativeTime.toFixed(2)}, extensions: ${totalTimeExtensions})`);
      
      // Check if it's time for the next goal to start
      if (elapsedMinutes >= cumulativeTime && currentGoalIndex === i) {
        const nextGoalIndex = i + 1;
        
        console.log(`Time for goal ${nextGoalIndex} to start (${elapsedMinutes.toFixed(2)} >= ${cumulativeTime.toFixed(2)}), moving from goal ${currentGoalIndex} to ${nextGoalIndex}`);
        
        // Mark current goal as complete
        console.log(`Marking goal ${currentGoalIndex} as complete`);
        onGoalComplete(goals[currentGoalIndex].id);
        
        // Trigger OpenAI analysis for the completed agenda item
        if (onAgendaItemComplete) {
          onAgendaItemComplete(currentGoalIndex);
        }
        
        // Update to next goal
        onCurrentGoalChange(nextGoalIndex);
        // Reset popup tracking for the new goal
        setPopupShownForGoal(null);
        break;
      }
    }
    
    // Handle completion of the last goal (conclusion)
    if (currentGoalIndex === goals.length - 1) {
      let cumulativeTime = 0;
      
      // Calculate cumulative time up to the last goal
      for (let j = 0; j < goals.length; j++) {
        cumulativeTime += goals[j].estimatedTime;
      }
      cumulativeTime += totalTimeExtensions;
      
      console.log(`Final goal should complete at: ${cumulativeTime.toFixed(2)} minutes`);
      
      // Check if the last goal's time has elapsed
      if (elapsedMinutes >= cumulativeTime && !goals[currentGoalIndex].completed) {
        console.log(`Time for final goal (conclusion) has elapsed (${elapsedMinutes.toFixed(2)} >= ${cumulativeTime.toFixed(2)}), marking as complete`);
        
        // Mark the conclusion as complete
        onGoalComplete(goals[currentGoalIndex].id);
        
        // Trigger OpenAI analysis for the completed conclusion
        if (onAgendaItemComplete) {
          onAgendaItemComplete(currentGoalIndex);
        }
      }
    }
  }, [currentTime, meetingStartTime, goals, currentGoalIndex, onCurrentGoalChange, onGoalComplete, onAgendaItemComplete, totalTimeExtensions]);

  // Calculate time left for current goal
  const getTimeLeftForCurrentGoal = () => {
    if (!meetingStartTime || currentGoalIndex < 0 || currentGoalIndex >= goals.length) return 0;

    const elapsedMinutes = (currentTime - meetingStartTime) / (1000 * 60);
    let cumulativeTime = 0;

    // Calculate start time of current goal
    for (let i = 0; i < currentGoalIndex; i++) {
      cumulativeTime += goals[i].estimatedTime;
    }
    
    // Add accumulated time extensions to all future goals
    cumulativeTime += totalTimeExtensions;

    const goalStartMinutes = cumulativeTime;
    const goalEndMinutes = goalStartMinutes + goals[currentGoalIndex].estimatedTime;
    const timeLeft = goalEndMinutes - elapsedMinutes;

    console.log(`Time calculation for goal ${currentGoalIndex}:`, {
      elapsedMinutes,
      cumulativeTime,
      goalStartMinutes,
      goalEndMinutes,
      timeLeft,
      totalTimeExtensions
    });

    return Math.max(0, timeLeft);
  };

  // Show popup when 30 seconds before scheduled end of current agenda item
  useEffect(() => {
    if (!meetingStartTime || currentGoalIndex < 0 || currentGoalIndex >= goals.length) return;
    
    const elapsedMinutes = (currentTime - meetingStartTime) / (1000 * 60);
    let cumulativeTime = 0;
    
    // Calculate cumulative time up to current goal
    for (let i = 0; i < currentGoalIndex; i++) {
      cumulativeTime += goals[i].estimatedTime;
    }
    
    // Add time extensions
    cumulativeTime += totalTimeExtensions;
    
    // Calculate when current goal should end
    const currentGoalEndTime = cumulativeTime + goals[currentGoalIndex].estimatedTime;
    const timeLeft = currentGoalEndTime - elapsedMinutes;
    
    console.log(`Popup check for goal ${currentGoalIndex}: elapsed=${elapsedMinutes}, goalEnd=${currentGoalEndTime}, timeLeft=${timeLeft}, showPopup=${showTimeExtensionPopup}, popupShownFor=${popupShownForGoal}`);
    
    // Show popup 30 seconds (0.5 minutes) before the scheduled end of current agenda item
    // Only show if we haven't already shown it for this goal
    const meetingElapsedMinutes = (currentTime - meetingStartTime) / (1000 * 60);
    const shouldShowPopup = timeLeft <= 0.5 && timeLeft > 0 && !showTimeExtensionPopup && meetingElapsedMinutes >= 0.5 && popupShownForGoal !== currentGoalIndex;
    
    if (shouldShowPopup) {
      console.log(`Triggering time extension popup for goal ${currentGoalIndex} (30 seconds before scheduled end)`);
      setShowTimeExtensionPopup(true);
      setPopupStartTime(Date.now());
      setPopupShownForGoal(currentGoalIndex); // Mark that we've shown popup for this goal
    }
  }, [currentTime, currentGoalIndex, goals, meetingStartTime, showTimeExtensionPopup, totalTimeExtensions, popupShownForGoal]);

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
      // Add 1 minute to the current goal
      onGoalTimeExtension(currentGoalIndex, 1);
      // Add 1 minute to all future goals as well
      setTotalTimeExtensions(prev => prev + 1);
      console.log(`Extended current goal and all future goals by 1 minute. Total extensions: ${totalTimeExtensions + 1}`);
    }
  };

  const getGoalStartTime = (goalIndex) => {
    if (!meetingStartTime) return null;
    
    let cumulativeTime = 0;
    
    // For the first goal (index 0), start at meeting start time
    if (goalIndex === 0) {
      const startTime = new Date(meetingStartTime);
      return startTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });
    }
    
    // For subsequent goals, calculate cumulative time
    for (let i = 0; i < goalIndex; i++) {
      cumulativeTime += goals[i].estimatedTime;
    }
    cumulativeTime += totalTimeExtensions; // Add accumulated time extensions
    
    const startTime = new Date(meetingStartTime + (cumulativeTime * 60 * 1000));
    return startTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
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

  // Replace the currentTimeString calculation with a static meeting start time
  const meetingStartTimeString = new Date(meetingStartTime).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  });

  return (
    <div className="meeting-progress">
      <h3>📊 Meeting Agenda</h3>
      
      <div className="meeting-time">
        <span className="time-label">Meeting Time:</span>
        <span className="time-value">{meetingStartTimeString}</span>
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
              <p className="popup-question">You have 30 seconds remaining</p>
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