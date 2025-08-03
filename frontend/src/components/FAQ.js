import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const faqData = [
    {
      question: "What is Huddle?",
      answer: "Huddle is an AI-powered meeting efficiency tool that helps teams conduct more productive meetings. It uses real-time transcription, smart agenda management, and AI insights to maximize meeting effectiveness and build consensus in real time.",
      icon: "🎯"
    },
    {
      question: "How does the Smart Assistant work?",
      answer: "The Smart Assistant uses Mastra AI to analyze your meeting transcript in real-time and provides intelligent suggestions, insights, and recommendations to keep your meeting focused and productive.",
      icon: "🤖"
    },
    {
      question: "Can I customize meeting goals and times?",
      answer: "Yes! You can set custom meeting goals, estimated times (including decimal values like 0.75 minutes), and complexity levels. The system will automatically track progress and provide time management suggestions.",
      icon: "⚙️"
    },
    {
      question: "What happens when an agenda item is completed?",
      answer: "When an agenda item is completed, the system automatically analyzes the transcript for that segment using AI to extract key decisions, takeaways, and action items. This information is saved and displayed in the Decisions panel."
    },
    {
      question: "How does the time extension feature work?",
      answer: "When you're running out of time for an agenda item, a popup appears asking if you want more time. You can choose 'Decide' to move on or 'More Time' to add 1 minute, which automatically adjusts all future agenda items."
    },
    {
      question: "What is the Efficiency Score?",
      answer: "The Efficiency Score is calculated based on completed goals, decisions made, and meeting outcomes. It provides a quantitative measure of your meeting's effectiveness, with a maximum score of 1000."
    },
    {
      question: "How does real-time transcription work?",
      answer: "Huddle uses Web Speech API for real-time transcription. As you speak during the meeting, your words are converted to text and displayed live, enabling the Smart Assistant to provide contextual insights."
    },
    {
      question: "Can I export meeting summaries?",
      answer: "Currently, meeting summaries and decisions are displayed in the completion page. Future versions will include export functionality for meeting reports and action items."
    },
    {
      question: "What AI technologies does Huddle use?",
      answer: "Huddle integrates with Mastra AI for intelligent meeting analysis, OpenAI for decision extraction, and Web Speech API for real-time transcription. This combination provides comprehensive meeting intelligence."
    },
    {
      question: "How do I get the best results from Huddle?",
      answer: "For optimal results: 1) Set clear, specific meeting goals, 2) Use realistic time estimates, 3) Speak clearly for better transcription, 4) Review and act on Smart Assistant suggestions, 5) Complete all agenda items to maximize your efficiency score."
    }
  ];

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const expandAll = () => {
    const allIndices = new Set(faqData.map((_, index) => index));
    setOpenItems(allIndices);
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <div className="faq-section">
      <div className="faq-header">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-controls">
          <button 
            className="faq-control-btn expand-all"
            onClick={expandAll}
          >
            Expand All
          </button>
          <button 
            className="faq-control-btn collapse-all"
            onClick={collapseAll}
          >
            Collapse All
          </button>
        </div>
      </div>
      
      <div className="faq-container">
        {faqData.map((item, index) => (
          <div key={index} className={`faq-item ${openItems.has(index) ? 'expanded' : ''}`}>
            <button
              className={`faq-question ${openItems.has(index) ? 'open' : ''}`}
              onClick={() => toggleItem(index)}
              aria-expanded={openItems.has(index)}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="faq-question-text">{item.question}</span>
              <span className="faq-icon">
                <svg 
                  className={`chevron ${openItems.has(index) ? 'rotated' : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path 
                    d="M6 12L10 8L6 4" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            <div 
              className={`faq-answer ${openItems.has(index) ? 'open' : ''}`}
              id={`faq-answer-${index}`}
            >
              <div className="faq-answer-content">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ; 