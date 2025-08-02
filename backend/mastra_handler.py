import requests
import os
import logging
import json
from dotenv import load_dotenv

# Load environment variables from root directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

logger = logging.getLogger(__name__)

class MastraHandler:
    def __init__(self):
        self.agent_url = os.getenv('MASTRA_AGENT_URL')
        self.api_key = os.getenv('MASTRA_API_KEY')
        
        if not self.agent_url or not self.api_key:
            logger.warning("Mastra environment variables not configured")
    
    def process_transcript(self, transcript):
        """
        Send transcript to Mastra agent and parse the response
        """
        if not self.agent_url or not self.api_key:
            logger.error("Mastra configuration missing")
            return None
        
        try:
            # Prepare request payload
            payload = {
                'transcript': transcript,
                'request_type': 'engineering_discussion_analysis'
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            logger.info(f"Sending transcript to Mastra agent at {self.agent_url}")
            
            # Make request to Mastra agent
            response = requests.post(
                self.agent_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"Mastra API returned status {response.status_code}: {response.text}")
                return None
            
            # Parse Mastra response
            mastra_data = response.json()
            
            # Extract the required components
            result = {
                'summary': mastra_data.get('summary', ''),
                'diagram': mastra_data.get('diagram', ''),
                'tasks': mastra_data.get('tasks', [])
            }
            
            logger.info(f"Successfully processed transcript with Mastra. Found {len(result['tasks'])} tasks")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request to Mastra failed: {str(e)}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Mastra response: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error processing transcript: {str(e)}")
            return None
    
    def validate_response(self, response_data):
        """
        Validate that the Mastra response contains required fields
        """
        required_fields = ['summary', 'diagram', 'tasks']
        
        for field in required_fields:
            if field not in response_data:
                logger.warning(f"Missing required field '{field}' in Mastra response")
                return False
        
        return True 