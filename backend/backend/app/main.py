from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ocr
# ADD THIS IMPORT:
from app.services.openbeautyfacts import OpenBeautyFactsClient

app = FastAPI(
    title="Cosmetic Safety Scanner API",
    description="API for scanning cosmetic products and analyzing safety & reviews",
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

# ADD THESE NEW ROUTES:
@app.get("/api/beauty/lookup/{barcode}")
async def lookup_beauty_product(barcode: str):
    """Fetch cosmetic product by barcode"""
    client = OpenBeautyFactsClient()
    return await client.get_product_by_barcode(barcode)

@app.get("/api/beauty/universal/{barcode}")
async def universal_product_scan(barcode: str):
    """Universal product scanner - auto-detects product type"""
    client = OpenBeautyFactsClient()
    return await client.universal_scan(barcode)

@app.get("/")
async def root():
    return {"message": "Cosmetic Safety Scanner API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)