from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import requests
import os

router = APIRouter()

@router.post("/extract-text")
async def extract_text_from_image(file: UploadFile = File(...)):
    """
    Extract text from product label image
    TODO: Integrate with Google Cloud Vision API
    """
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # For now, return mock data
        return {
            "success": True,
            "filename": file.filename,
            "content_type": file.content_type,
            "message": "OCR processing successful (mock)",
            "extracted_text": "Ingredients: Water, Glycerin, Sodium Laureth Sulfate...",
            "ingredients": [
                "Water",
                "Glycerin",
                "Sodium Laureth Sulfate",
                "Cocamidopropyl Betaine",
                "Fragrance"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@router.post("/batch-check")
async def batch_check_ingredients(ingredients: List[str]):
    """
    Check safety for multiple ingredients
    TODO: Integrate with EWG API
    """
    mock_results = []
    
    for ingredient in ingredients:
        mock_results.append({
            "ingredient": ingredient,
            "safety_score": 8 if "water" in ingredient.lower() else 4,
            "rating": "Excellent" if "water" in ingredient.lower() else "Moderate",
            "hazards": [] if "water" in ingredient.lower() else ["Potential skin irritation"]
        })
    
    return {
        "success": True,
        "results": mock_results,
        "average_score": 6.0,
        "overall_rating": "Moderate"
    }
