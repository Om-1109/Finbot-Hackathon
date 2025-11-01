from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat_router  # make sure this import path is correct

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router.router)  # or app.include_router(chat_router, prefix="/api") depending on your router

@app.get("/")
async def root():
    return {"status": "ok"}
