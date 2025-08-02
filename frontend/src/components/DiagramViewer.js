import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const DiagramViewer = ({ diagram }) => {
  const diagramRef = useRef(null);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }, []);

  useEffect(() => {
    if (diagram && diagramRef.current) {
      try {
        // Clear previous content
        diagramRef.current.innerHTML = '';
        
        // Create a unique ID for the diagram
        const diagramId = `mermaid-diagram-${Date.now()}`;
        diagramRef.current.id = diagramId;
        
        // Set the diagram content
        diagramRef.current.innerHTML = diagram;
        
        // Render the diagram
        mermaid.init(undefined, `#${diagramId}`);
        
      } catch (error) {
        console.error('Error rendering mermaid diagram:', error);
        diagramRef.current.innerHTML = `
          <div style="padding: 1rem; color: #6c757d; text-align: center;">
            <p>Error rendering diagram</p>
            <pre style="background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem;">
              ${diagram}
            </pre>
          </div>
        `;
      }
    }
  }, [diagram]);

  if (!diagram) {
    return null;
  }

  return (
    <div className="diagram-container">
      <h3>System Diagram</h3>
      <div className="diagram-content">
        <div ref={diagramRef}></div>
      </div>
      
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem', 
        background: '#e8f5e8', 
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#2d5a2d'
      }}>
        💡 This diagram was automatically generated from the conversation analysis.
      </div>
    </div>
  );
};

export default DiagramViewer; 