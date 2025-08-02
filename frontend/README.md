# Voice Engineering Discussions - Frontend

React frontend for the Voice Engineering Discussions application.

## Features

- 🎤 **Voice Recording**: Record engineering discussions with real-time transcription
- 📝 **Live Transcript**: View conversation transcript as it's being recorded
- 📊 **System Diagrams**: Render Mermaid.js diagrams from conversation analysis
- ✅ **Task Extraction**: Display extracted tasks with assignees and priorities
- 📱 **Responsive Design**: Modern, mobile-friendly interface

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env file
   echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## Environment Variables

```bash
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Deployment (Vercel)

### Automatic Deployment

1. **Connect your GitHub repository to Vercel**
2. **Import the project**
3. **Configure build settings:**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
4. **Set environment variables in Vercel dashboard:**
   - `REACT_APP_BACKEND_URL`: Your deployed backend URL
5. **Deploy**

### Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

## Component Structure

```
src/
├── components/
│   ├── Recorder.js           # Microphone handling
│   ├── TranscriptDisplay.js  # Real-time transcript
│   ├── FeaturePanel.js       # Extracted tasks display
│   └── DiagramViewer.js      # Mermaid diagram renderer
├── App.js                    # Main application component
├── App.css                   # Main styles
├── index.js                  # App entry point
└── index.css                 # Global styles
```

## Technologies Used

- **React 18**: Modern React with hooks
- **Mermaid.js**: Diagram rendering
- **CSS3**: Modern styling with animations
- **Fetch API**: HTTP requests to backend

## Development

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use CSS classes for styling
- Keep components modular and reusable

### Testing
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Troubleshooting

### Common Issues

1. **Backend connection failed**
   - Check `REACT_APP_BACKEND_URL` environment variable
   - Ensure backend server is running
   - Check CORS configuration on backend

2. **Microphone access denied**
   - Check browser permissions
   - Ensure HTTPS in production (required for microphone access)

3. **Mermaid diagrams not rendering**
   - Check diagram syntax
   - Ensure mermaid.js is properly imported
   - Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 