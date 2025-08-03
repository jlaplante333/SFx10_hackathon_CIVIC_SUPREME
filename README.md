# SFx10 - Civic Meetings Supreme

A fullstack web application that enables voice-based civic meetings to be transcribed, analyzed, and turned into structured meeting output.

## Features

- 🎤 **Voice Recording**: Record engineering discussions with real-time transcription
- 📝 **Live Transcript**: View conversation transcript as it's being recorded
- 🧠 **AI Analysis**: Automatic analysis of discussions using Mastra REST API agent
- 📊 **System Diagrams**: Generate Mermaid.js system diagrams from conversations
- ✅ **Task Extraction**: Automatically extract tasks with assignees and priorities
- 🔗 **External Integration**: Push tasks to Notion, Jira, or other tools via Composio
- 📱 **Responsive Design**: Modern, mobile-friendly interface

## Architecture

### Backend (Flask)
- **`app.py`**: Main Flask application with webhook endpoint
- **`mastra_handler.py`**: Handles communication with Mastra REST API agent
- **`composio_helper.py`**: Manages external tool integrations (Notion, Jira)
- **`requirements.txt`**: Python dependencies
- **`Procfile`**: Deployment configuration for Render

### Frontend (React)
- **`App.js`**: Main application component with polling logic
- **`Recorder.js`**: Microphone handling and recording state
- **`TranscriptDisplay.js`**: Real-time transcript display
- **`FeaturePanel.js`**: Extracted tasks and features display
- **`DiagramViewer.js`**: Mermaid.js diagram rendering

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

5. **Run the Flask server:**
   ```bash
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file in frontend directory
   echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```bash
# Mastra Configuration (Required)
MASTRA_AGENT_URL=https://api.mastra.ai/v1/agents/your-agent-id
MASTRA_API_KEY=your_mastra_api_key_here

# Composio Configuration (Optional)
COMPOSIO_API_KEY=your_composio_api_key_here
COMPOSIO_BASE_URL=https://api.composio.dev

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:5000
```

## API Endpoints

### POST `/vapi-webhook`
Receives transcript from Vapi.ai and processes it through Mastra agent.

**Request Body:**
```json
{
  "transcript": "Let's discuss the new microservice architecture..."
}
```

**Response:**
```json
{
  "summary": "Meeting focused on implementing microservice architecture...",
  "diagram": "graph TD\n    A[Frontend] --> B[API Gateway]...",
  "tasks": [
    {
      "title": "Implement JWT authentication",
      "assignee": "John Doe",
      "priority": "high",
      "description": "Set up JWT tokens and refresh token rotation"
    }
  ]
}
```

## Deployment

### Backend (Render)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure build settings:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. **Set environment variables in Render dashboard**
5. **Deploy**

### Frontend (Vercel)

1. **Connect your GitHub repository to Vercel**
2. **Set build settings:**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
3. **Set environment variables in Vercel dashboard**
4. **Deploy**

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Code Structure
```
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── mastra_handler.py      # Mastra API integration
│   ├── composio_helper.py     # External tool integrations
│   ├── requirements.txt       # Python dependencies
│   ├── Procfile              # Render deployment config
│   └── env.example           # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.js            # Main app component
│   │   └── App.css           # Main styles
│   ├── public/
│   ├── package.json          # Node dependencies
│   └── README.md
└── README.md                 # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 