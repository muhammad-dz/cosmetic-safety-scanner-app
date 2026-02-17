from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ocr, sentiment
import uvicorn

app = FastAPI(
    title="Personal Care Product Safety Scanner API",  # Update this
    description="API for scanning personal care products and analyzing safety & reviews",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(sentiment.router, prefix="/api", tags=["Sentiment"])

@app.get("/")
async def root():
    return {"message": "Cosmetic Safety Scanner API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)