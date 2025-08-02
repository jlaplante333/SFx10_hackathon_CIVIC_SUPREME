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
        logger.info(f"Received transcript: {transcript[:100]}...")
        
        # Send to Mastra agent
        mastra_response = mastra_handler.process_transcript(transcript)
        
        if not mastra_response:
            return jsonify({'error': 'Failed to process transcript with Mastra'}), 500
        
        # Extract components from Mastra response
        summary = mastra_response.get('summary', '')
        diagram = mastra_response.get('diagram', '')
        tasks = mastra_response.get('tasks', [])
        
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
            'tasks': tasks
        }
        
        logger.info(f"Successfully processed transcript. Summary: {summary[:50]}...")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('BACKEND_PORT', 5000))
    host = os.environ.get('BACKEND_HOST', '0.0.0.0')
    app.run(host=host, port=port, debug=True) 