import requests
import os
import logging
import json
from dotenv import load_dotenv

# Load environment variables from root directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

logger = logging.getLogger(__name__)

class ComposioHelper:
    def __init__(self):
        self.api_key = os.getenv('COMPOSIO_API_KEY')
        self.base_url = os.getenv('COMPOSIO_BASE_URL', 'https://api.composio.dev')
        
        if not self.api_key:
            logger.warning("Composio API key not configured")
    
    def push_tasks(self, tasks):
        """
        Push tasks to external tools via Composio
        """
        if not self.api_key:
            logger.error("Composio API key not configured")
            return False
        
        if not tasks:
            logger.info("No tasks to push")
            return True
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            success_count = 0
            
            for task in tasks:
                try:
                    # Prepare task data for Composio
                    task_payload = {
                        'title': task.get('title', 'Untitled Task'),
                        'description': task.get('description', ''),
                        'assignee': task.get('assignee', ''),
                        'priority': task.get('priority', 'medium'),
                        'status': 'todo'
                    }
                    
                    # Push to Notion (if configured)
                    if self._push_to_notion(task_payload):
                        success_count += 1
                    
                    # Push to Jira (if configured)
                    if self._push_to_jira(task_payload):
                        success_count += 1
                        
                except Exception as e:
                    logger.error(f"Failed to push task '{task.get('title', 'Unknown')}': {str(e)}")
            
            logger.info(f"Successfully pushed {success_count} tasks to external tools")
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error pushing tasks to external tools: {str(e)}")
            return False
    
    def _push_to_notion(self, task_data):
        """
        Push task to Notion via Composio
        """
        try:
            # This would use Composio's Notion integration
            # For now, we'll simulate the API call
            notion_endpoint = f"{self.base_url}/notion/tasks"
            
            response = requests.post(
                notion_endpoint,
                json=task_data,
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully pushed task to Notion: {task_data['title']}")
                return True
            else:
                logger.warning(f"Failed to push to Notion: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error pushing to Notion: {str(e)}")
            return False
    
    def _push_to_jira(self, task_data):
        """
        Push task to Jira via Composio
        """
        try:
            # This would use Composio's Jira integration
            # For now, we'll simulate the API call
            jira_endpoint = f"{self.base_url}/jira/issues"
            
            # Transform task data for Jira format
            jira_payload = {
                'summary': task_data['title'],
                'description': task_data['description'],
                'assignee': task_data['assignee'],
                'priority': self._map_priority_to_jira(task_data['priority'])
            }
            
            response = requests.post(
                jira_endpoint,
                json=jira_payload,
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully pushed task to Jira: {task_data['title']}")
                return True
            else:
                logger.warning(f"Failed to push to Jira: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error pushing to Jira: {str(e)}")
            return False
    
    def _map_priority_to_jira(self, priority):
        """
        Map internal priority to Jira priority levels
        """
        priority_map = {
            'high': 'High',
            'medium': 'Medium', 
            'low': 'Low'
        }
        return priority_map.get(priority.lower(), 'Medium')
    
    def get_available_connections(self):
        """
        Get list of available external tool connections
        """
        try:
            response = requests.get(
                f"{self.base_url}/connections",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to get connections: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting connections: {str(e)}")
            return [] 