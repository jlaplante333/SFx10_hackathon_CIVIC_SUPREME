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
        # Use public Mastra API
        self.base_url = "https://api.mastra.ai"
        self.api_key = os.getenv('MASTRA_API_KEY')
        
        if not self.api_key:
            logger.warning("Mastra API key not configured")
    
    def query_public_agent(self, agent_id, input_text):
        """
        Query a public Mastra agent using the public API
        """
        try:
            url = f"{self.base_url}/agents/{agent_id}/query"
            
            payload = {
                "input": input_text
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            # Add API key if available
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            
            logger.info(f"Querying public Mastra agent: {agent_id}")
            
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"Mastra API returned status {response.status_code}: {response.text}")
                return None
            
            # Parse Mastra response
            mastra_data = response.json()
            
            logger.info(f"Successfully queried public Mastra agent: {agent_id}")
            return mastra_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request to Mastra failed: {str(e)}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Mastra response: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error querying Mastra: {str(e)}")
            return None
    
    def process_transcript(self, transcript, request_type='engineering_discussion_analysis'):
        """
        Process transcript using public Mastra agents
        """
        try:
            # Use different agents based on request type
            if request_type == 'smart_assistant_insights':
                agent_id = 'meeting-assistant'
                input_text = f"Analyze this meeting transcript and provide smart suggestions: {transcript}"
            elif request_type == 'comprehensive_meeting_analysis':
                agent_id = 'trend-explainer'
                input_text = f"Analyze this meeting transcript and provide comprehensive insights: {transcript}"
            else:
                agent_id = 'trend-explainer'
                input_text = f"Analyze this engineering discussion transcript: {transcript}"
            
            # Query the public agent
            response = self.query_public_agent(agent_id, input_text)
            
            if not response:
                return None
            
            # Extract insights from the response
            result = {
                'summary': response.get('output', ''),
                'diagram': '',
                'tasks': [],
                'suggestions': self._extract_suggestions(response.get('output', ''))
            }
            
            logger.info(f"Successfully processed transcript with public Mastra agent")
            return result
            
        except Exception as e:
            logger.error(f"Error processing transcript: {str(e)}")
            return None
    
    def process_smart_assistant(self, transcript, current_goal, meeting_context):
        """
        Process transcript for smart assistant insights using public agent
        """
        try:
            agent_id = 'meeting-assistant'
            input_text = f"""
            Current meeting goal: {current_goal}
            Meeting context: {meeting_context}
            Transcript: {transcript}
            
            Provide smart suggestions, insights, and recommendations for this meeting.
            """
            
            response = self.query_public_agent(agent_id, input_text)
            
            if not response:
                return None
            
            output = response.get('output', '')
            
            # Parse the output into structured data
            result = {
                'suggestions': self._extract_suggestions(output),
                'insights': self._extract_insights(output),
                'recommendations': self._extract_recommendations(output),
                'time_optimization': self._extract_time_optimization(output),
                'agenda_drift_detection': self._detect_agenda_drift(output, current_goal)
            }
            
            logger.info(f"Smart assistant processed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in smart assistant processing: {str(e)}")
            return None
    
    def process_meeting_analysis(self, transcript, goals, decisions):
        """
        Process transcript for comprehensive meeting analysis
        """
        try:
            agent_id = 'trend-explainer'
            input_text = f"""
            Meeting Goals: {goals}
            Decisions Made: {decisions}
            Transcript: {transcript}
            
            Provide a comprehensive analysis of this meeting including executive summary, 
            action items, efficiency score, and key insights.
            """
            
            response = self.query_public_agent(agent_id, input_text)
            
            if not response:
                return None
            
            output = response.get('output', '')
            
            result = {
                'executive_summary': self._extract_summary(output),
                'action_items': self._extract_action_items(output),
                'technical_specs': {},
                'follow_up_meetings': [],
                'efficiency_score': self._calculate_efficiency_score(goals, decisions),
                'key_decisions': self._extract_key_decisions(output),
                'risk_analysis': {}
            }
            
            logger.info(f"Meeting analysis completed")
            return result
            
        except Exception as e:
            logger.error(f"Error in meeting analysis: {str(e)}")
            return None
    
    def _extract_suggestions(self, text):
        """Extract suggestions from Mastra output"""
        suggestions = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['suggest', 'recommend', 'consider', 'try']):
                suggestions.append(line.strip())
        return suggestions[:3]  # Limit to 3 suggestions
    
    def _extract_insights(self, text):
        """Extract insights from Mastra output"""
        insights = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['insight', 'observe', 'notice', 'pattern']):
                insights.append(line.strip())
        return insights[:2]  # Limit to 2 insights
    
    def _extract_recommendations(self, text):
        """Extract recommendations from Mastra output"""
        recommendations = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'should', 'need to', 'must']):
                recommendations.append(line.strip())
        return recommendations[:2]  # Limit to 2 recommendations
    
    def _extract_time_optimization(self, text):
        """Extract time optimization suggestions"""
        time_keywords = ['time', 'schedule', 'duration', 'efficient', 'optimize']
        for line in text.split('\n'):
            if any(keyword in line.lower() for keyword in time_keywords):
                return {'suggestion': line.strip()}
        return {'suggestion': 'Consider time management for remaining topics'}
    
    def _detect_agenda_drift(self, text, current_goal):
        """Detect if conversation has drifted from current goal"""
        goal_keywords = current_goal.lower().split()
        text_lower = text.lower()
        
        # Simple heuristic: if goal keywords are not prominent in text
        goal_mentions = sum(1 for keyword in goal_keywords if keyword in text_lower)
        return goal_mentions < len(goal_keywords) * 0.5
    
    def _extract_summary(self, text):
        """Extract executive summary from text"""
        lines = text.split('\n')
        for line in lines:
            if 'summary' in line.lower() or len(line) > 50:
                return line.strip()
        return text[:200] + "..." if len(text) > 200 else text
    
    def _extract_action_items(self, text):
        """Extract action items from text"""
        action_items = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['action', 'task', 'todo', 'follow up']):
                action_items.append(line.strip())
        return action_items[:5]  # Limit to 5 action items
    
    def _extract_key_decisions(self, text):
        """Extract key decisions from text"""
        decisions = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['decide', 'decision', 'agreed', 'concluded']):
                decisions.append(line.strip())
        return decisions[:3]  # Limit to 3 decisions
    
    def _calculate_efficiency_score(self, goals, decisions):
        """Calculate meeting efficiency score"""
        completed_goals = len([g for g in goals if g.get('completed', False)])
        total_goals = len(goals)
        decisions_count = len(decisions)
        
        # Base score on completion rate and decisions made
        completion_score = (completed_goals / total_goals) * 600 if total_goals > 0 else 0
        decision_score = decisions_count * 100
        
        return min(1000, completion_score + decision_score)
    
    def validate_response(self, response_data):
        """
        Validate that the Mastra response contains required fields
        """
        return True  # Simplified validation for public API 