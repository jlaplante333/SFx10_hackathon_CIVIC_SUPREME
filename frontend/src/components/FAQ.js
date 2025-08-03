import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const faqData = [
    {
      question: "What is Civic Supreme?",
      answer: "Civic Supreme is an AI-powered civic intelligence platform designed to help San Francisco and other cities conduct more efficient meetings and make data-driven decisions. It combines real-time transcription, interactive maps with orchestra data, and instant intelligence to transform how cities plan and execute civic initiatives.",
      icon: "🏛️"
    },
    {
      question: "How does the Interactive Map feature work?",
      answer: "Our interactive maps integrate with orchestra data and other civic datasets to provide instant intelligence on city infrastructure, demographics, and community needs. City officials can visualize data in real-time during meetings, making informed decisions based on comprehensive civic intelligence.",
      icon: "🗺️"
    },
    {
      question: "How does the Smart Assistant help with civic meetings?",
      answer: "The Smart Assistant uses AI to analyze meeting transcripts in real-time and provides intelligent suggestions, insights, and recommendations specifically tailored for civic planning. It helps city officials stay focused on community priorities and make data-driven decisions.",
      icon: "🤖"
    },
    {
      question: "Can I customize meeting goals for different city departments?",
      answer: "Yes! You can set custom meeting goals for various city departments like transportation, housing, public safety, and environmental services. The system tracks progress and provides time management suggestions optimized for civic workflows.",
      icon: "⚙️"
    },
    {
      question: "What happens when a civic agenda item is completed?",
      answer: "When a civic agenda item is completed, the system automatically analyzes the transcript using AI to extract key decisions, community impact assessments, and action items. This information is saved and displayed in the Decisions panel for follow-up.",
      icon: "📋"
    },
    {
      question: "How does the time extension feature work for city meetings?",
      answer: "When city officials are running out of time for an agenda item, a popup appears asking if they want more time. They can choose 'Decide' to move on or 'More Time' to add time, which automatically adjusts all future agenda items to maintain meeting efficiency.",
      icon: "⏰"
    },
    {
      question: "What is the Civic Efficiency Score?",
      answer: "The Civic Efficiency Score is calculated based on completed goals, decisions made, and community outcomes. It provides a quantitative measure of your civic meeting's effectiveness, with a maximum score of 1000, helping cities track their governance performance.",
      icon: "📊"
    },
    {
      question: "How does real-time transcription work for city meetings?",
      answer: "Civic Supreme uses Web Speech API for real-time transcription. As city officials speak during meetings, their words are converted to text and displayed live, enabling the Smart Assistant to provide contextual insights and data-driven recommendations.",
      icon: "🎤"
    },
    {
      question: "What data sources does Civic Supreme integrate with?",
      answer: "Civic Supreme integrates with orchestra data, city databases, demographic information, infrastructure maps, and other civic datasets. This provides comprehensive intelligence for informed decision-making during city meetings.",
      icon: "🔗"
    },
    {
      question: "How do I get the best results from Civic Supreme?",
      answer: "For optimal civic results: 1) Set clear, community-focused meeting goals, 2) Use realistic time estimates for complex civic issues, 3) Speak clearly for better transcription, 4) Review and act on Smart Assistant suggestions, 5) Complete all agenda items to maximize your civic efficiency score and community impact."
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