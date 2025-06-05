# LP Analysis System - Next.js + FastAPI

🔍 AI-Powered A/B Test Image Analysis with OpenAI Vision

## Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: FastAPI with async support
- **AI**: OpenAI Vision API for image analysis
- **State Management**: TanStack Query + Zustand
- **Styling**: Tailwind CSS + Framer Motion

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"

# Run server
python main.py
# Server starts at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App starts at http://localhost:3000
```

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000  # For local development
# For production: https://your-backend-url.com
```

## Features

### 🖼️ Image Upload & Management
- Drag & drop interface with react-dropzone
- Real-time image preview and validation
- Automatic image processing and optimization
- Support for PNG, JPG, JPEG, WebP formats

### 🔍 AI-Powered Analysis
- **Stage 1**: Structure and layout analysis
- **Stage 2**: Detailed content analysis
- **Stage 3**: Final recommendations with performance integration
- Real-time progress tracking with WebSocket-like updates

### 📊 Performance Integration
- A/B test metrics input (visitors, conversions, CVR)
- Statistical significance analysis
- Data-driven recommendations

### 💼 Session Management
- Multiple analysis sessions
- Persistent session state
- History tracking and retrieval

### 📋 Results & Export
- Markdown-formatted analysis reports
- JSON/Text export functionality
- Downloadable analysis results

## API Endpoints

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/{id}` - Get session details

### Upload
- `POST /api/upload` - Upload images (A/B pair)

### Analysis
- `POST /api/analysis/start` - Start analysis process
- `GET /api/analysis/{id}/status` - Get progress status
- `GET /api/analysis/{id}/results` - Get final results

## Deployment

### Backend (Railway/Render)
```bash
# Requirements
pip install -r backend/requirements.txt

# Start command
python backend/main.py

# Environment variables
OPENAI_API_KEY=your_key_here
```

### Frontend (Vercel)
```bash
# Build command
npm run build

# Environment variables
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Development

### Backend Development
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Type Checking
```bash
cd frontend
npm run type-check
```

## Tech Stack Details

### Frontend Dependencies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **TanStack Query**: Server state management
- **React Dropzone**: File upload interface
- **Lucide React**: Icon library
- **Axios**: HTTP client

### Backend Dependencies
- **FastAPI**: Modern Python web framework
- **OpenAI**: AI integration
- **Pillow**: Image processing
- **Pydantic**: Data validation
- **Aiofiles**: Async file operations

## File Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── services/
│   │   ├── openai_service.py    # OpenAI API integration
│   │   └── image_service.py     # Image processing
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── analysis/[id]/       # Analysis pages
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Utilities
│   └── types/
│       └── index.ts           # TypeScript types
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License