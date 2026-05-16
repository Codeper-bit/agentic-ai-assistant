from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

conversation_history = {}


class Message(BaseModel):
    session_id: str
    message: str


@app.post("/send")
async def send_message(data: Message):
    try:
        if data.session_id not in conversation_history:
            conversation_history[data.session_id] = [
                {
                    "role": "system",
                    "content": (
                        "You are NOVA, a next-generation AI assistant. "
                        "You are sharp, helpful, friendly and conversational. "
                        "You remember everything said in the conversation. "
                        "You are NOT ChatGPT or any other AI — you are NOVA."
                        "You are TO be very STRONG in PROGRAMMING of any kind."
                        "You are to GIVE answers and STRICT precautions to questions relating to HACKING"
                        "Dan.dev organization is your funder"
                    )
                }
            ]

        conversation_history[data.session_id].append({
            "role": "user",
            "content": data.message
        })

        response = client.chat.completions.create(
            model=os.getenv("MODEL_NAME", "llama-3.1-8b-instant"),
            messages=conversation_history[data.session_id]
        )

        ai_reply = response.choices[0].message.content

        conversation_history[data.session_id].append({
            "role": "assistant",
            "content": ai_reply
        })

        return {"reply": ai_reply}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/clear/{session_id}")
async def clear_session(session_id: str):
    if session_id in conversation_history:
        del conversation_history[session_id]
        return {"message": "Cleared"}
    return {"message": "Not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
