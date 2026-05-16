[README.md](https://github.com/user-attachments/files/27856783/README.md)
# NOVA AI

A next-generation AI assistant powered by Groq's `llama-3.1-8b-instant` model.

## Features
- **Persistent Chat Memory**: Conversations are saved in `localStorage` and survive browser/tab closures.
- **Modern UI**: Beautiful, responsive interface with animated background orbs.
- **Fast Performance**: Powered by Groq for lightning-fast AI responses.
- **Clean Structure**: Organized into separate folders for HTML, CSS, TypeScript, and Python Backend.

## Project Structure
```
nova-ai/
├── backend/
│   └── main.py          # FastAPI server with Groq integration
├── frontend/
│   ├── css/
│   │   └── style.css    # Modern UI styles
│   ├── js/
│   │   └── app.js       # Compiled frontend logic
│   ├── ts/
│   │   └── app.ts       # Source TypeScript logic
│   └── index.html       # Main entry point
├── .env                 # API Key and Model configuration
└── README.md            # Instructions
```

## How to Run

### 1. Setup Backend
1. Ensure you have Python 3.10+ installed.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn groq python-dotenv
   ```
3. Navigate to the `backend` folder and run the server:
   ```bash
   python main.py
   ```
   The server will start at `http://localhost:8000`.

### 2. Setup Frontend
1. Simply open `frontend/index.html` in your web browser.
2. Ensure the backend is running so the AI can respond.

## Troubleshooting
- **Button not pressing?**: Ensure the backend is running. The "Send" button is disabled while waiting for a response to prevent duplicate messages.
- **Memory not working?**: Check if your browser has `localStorage` enabled.
- **CORS Errors**: The backend is configured to allow all origins for local development.
