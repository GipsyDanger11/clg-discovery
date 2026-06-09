import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="College Discovery AI Chatbot Service")

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "mistral-large-latest")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

SYSTEM_PROMPT = """You are a helpful college discovery assistant helping students find the best colleges in India.

When suggesting colleges, ALWAYS format your response with clear structure:

For each college, include:
• Name - bold
• Location - city, state
• Type - Government / Private
• Cutoff - entrance exam and approximate percentile/rank
• Fees - annual tuition
• Placements - average package
• Ranking - NIRF or other known ranking

Organize colleges by category (e.g., Engineering, Science, Commerce).
Use bullet points and short paragraphs. Be specific with numbers.
If exact data isn't known, give realistic estimates and note them.
Be concise. If you don't know something, say so honestly."""


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[dict[str, str]] | None = None


class ChatResponse(BaseModel):
    response: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not MISTRAL_API_KEY:
        return ChatResponse(
            response="AI service is not configured. Please set MISTRAL_API_KEY in the environment."
        )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if request.conversation_history:
        for msg in request.conversation_history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": request.message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                MISTRAL_API_URL,
                headers={
                    "Authorization": f"Bearer {MISTRAL_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": MISTRAL_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1024,
                },
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Mistral API error: {response.status_code}",
                )

            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]

            return ChatResponse(response=ai_response)

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI service timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
