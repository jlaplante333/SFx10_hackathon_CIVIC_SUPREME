#!/usr/bin/env python3
"""
Simple test script for the Voice Engineering Discussions backend
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from root directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get('http://localhost:5000/health')
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_webhook_endpoint():
    """Test the webhook endpoint with sample transcript"""
    sample_transcript = """
    Let's discuss the new microservice architecture for our user authentication system. 
    We need to implement JWT tokens with refresh token rotation for better security. 
    The database schema should include user roles and permissions tables. 
    I think we should use Redis for session management and caching. 
    We'll need to set up CI/CD pipelines for automated testing and deployment.
    """
    
    payload = {
        'transcript': sample_transcript.strip()
    }
    
    try:
        response = requests.post(
            'http://localhost:5000/vapi-webhook',
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Webhook test: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response data:")
            print(f"- Summary: {data.get('summary', 'N/A')[:100]}...")
            print(f"- Diagram: {data.get('diagram', 'N/A')[:100]}...")
            print(f"- Tasks: {len(data.get('tasks', []))} tasks found")
            
            # Print tasks
            for i, task in enumerate(data.get('tasks', [])):
                print(f"  Task {i+1}: {task.get('title', 'Untitled')}")
                print(f"    Assignee: {task.get('assignee', 'Unassigned')}")
                print(f"    Priority: {task.get('priority', 'Medium')}")
        else:
            print(f"Error response: {response.text}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"Webhook test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing Voice Engineering Discussions Backend")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    health_ok = test_health_endpoint()
    
    # Test webhook endpoint
    print("\n2. Testing webhook endpoint...")
    webhook_ok = test_webhook_endpoint()
    
    # Summary
    print("\n" + "=" * 50)
    print("Test Results:")
    print(f"Health endpoint: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"Webhook endpoint: {'✅ PASS' if webhook_ok else '❌ FAIL'}")
    
    if health_ok and webhook_ok:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed. Check the output above.")

if __name__ == '__main__':
    main() 