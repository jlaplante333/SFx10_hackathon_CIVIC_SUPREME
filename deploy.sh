#!/bin/bash

# Voice Engineering Discussions - Deployment Script
# This script helps set up and run the application locally

set -e

echo "🎤 Voice Engineering Discussions - Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Prerequisites check passed!"

# Backend setup
print_status "Setting up backend..."

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_warning "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit backend/.env with your API keys before running the application."
fi

# Go back to root
cd ..

# Frontend setup
print_status "Setting up frontend..."

cd frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating frontend .env file..."
    echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env
fi

# Go back to root
cd ..

print_status "Setup complete!"
echo ""
echo "🚀 To run the application:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python app.py"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open your browser to http://localhost:3000"
echo ""
echo "📝 Don't forget to:"
echo "   - Edit backend/.env with your Mastra API credentials"
echo "   - Set up Composio API key if you want external tool integration"
echo ""
echo "🧪 To test the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python test_app.py" 