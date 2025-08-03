from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
from mastra_handler import MastraHandler
from composio_helper import ComposioHelper

# Load environment variables from root directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize handlers
mastra_handler = MastraHandler()
composio_helper = ComposioHelper()

@app.route('/vapi-webhook', methods=['POST'])
def vapi_webhook():
    """
    Webhook endpoint that receives transcript from Vapi.ai
    """
    try:
        # Get JSON payload
        data = request.get_json()
        
        if not data or 'transcript' not in data:
            return jsonify({'error': 'Missing transcript in request'}), 400
        
        transcript = data['transcript']
        request_type = data.get('request_type', 'engineering_discussion_analysis')
        logger.info(f"Received transcript: {transcript[:100]}...")
        
        # Send to Mastra agent with specific request type
        mastra_response = mastra_handler.process_transcript(transcript, request_type)
        
        if not mastra_response:
            return jsonify({'error': 'Failed to process transcript with Mastra'}), 500
        
        # Extract components from Mastra response
        summary = mastra_response.get('summary', '')
        diagram = mastra_response.get('diagram', '')
        tasks = mastra_response.get('tasks', [])
        suggestions = mastra_response.get('suggestions', [])
        
        # Push tasks to external tools if Composio is configured
        if os.getenv('COMPOSIO_API_KEY'):
            try:
                composio_helper.push_tasks(tasks)
                logger.info(f"Successfully pushed {len(tasks)} tasks to external tools")
            except Exception as e:
                logger.error(f"Failed to push tasks to external tools: {str(e)}")
        
        response_data = {
            'summary': summary,
            'diagram': diagram,
            'tasks': tasks,
            'suggestions': suggestions
        }
        
        logger.info(f"Successfully processed transcript. Summary: {summary[:50]}...")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/smart-assistant', methods=['POST'])
def smart_assistant():
    """
    Smart assistant endpoint for real-time meeting insights
    """
    try:
        data = request.get_json()
        
        if not data or 'transcript' not in data:
            return jsonify({'error': 'Missing transcript in request'}), 400
        
        transcript = data['transcript']
        current_goal = data.get('current_goal', '')
        meeting_context = data.get('meeting_context', {})
        
        logger.info(f"Smart assistant request for goal: {current_goal}")
        
        # Process with Mastra for smart assistant insights
        mastra_response = mastra_handler.process_smart_assistant(
            transcript, 
            current_goal, 
            meeting_context
        )
        
        if not mastra_response:
            return jsonify({'error': 'Failed to process smart assistant request'}), 500
        
        response_data = {
            'suggestions': mastra_response.get('suggestions', []),
            'insights': mastra_response.get('insights', []),
            'recommendations': mastra_response.get('recommendations', []),
            'time_optimization': mastra_response.get('time_optimization', {}),
            'agenda_drift_detection': mastra_response.get('agenda_drift_detection', False)
        }
        
        logger.info(f"Smart assistant processed successfully. Generated {len(response_data['suggestions'])} suggestions")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error processing smart assistant request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/meeting-analysis', methods=['POST'])
def meeting_analysis():
    """
    Comprehensive meeting analysis endpoint
    """
    try:
        data = request.get_json()
        
        if not data or 'transcript' not in data:
            return jsonify({'error': 'Missing transcript in request'}), 400
        
        transcript = data['transcript']
        goals = data.get('goals', [])
        decisions = data.get('decisions', {})
        
        logger.info(f"Meeting analysis request for {len(goals)} goals")
        
        # Process with Mastra for comprehensive analysis
        mastra_response = mastra_handler.process_meeting_analysis(
            transcript, 
            goals, 
            decisions
        )
        
        if not mastra_response:
            return jsonify({'error': 'Failed to process meeting analysis'}), 500
        
        response_data = {
            'executive_summary': mastra_response.get('executive_summary', ''),
            'action_items': mastra_response.get('action_items', []),
            'technical_specs': mastra_response.get('technical_specs', {}),
            'follow_up_meetings': mastra_response.get('follow_up_meetings', []),
            'efficiency_score': mastra_response.get('efficiency_score', 0),
            'key_decisions': mastra_response.get('key_decisions', []),
            'risk_analysis': mastra_response.get('risk_analysis', {})
        }
        
        logger.info(f"Meeting analysis completed. Efficiency score: {response_data['efficiency_score']}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error processing meeting analysis: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('BACKEND_PORT', 5000))
    host = os.environ.get('BACKEND_HOST', '0.0.0.0')
    app.run(host=host, port=port, debug=True) 