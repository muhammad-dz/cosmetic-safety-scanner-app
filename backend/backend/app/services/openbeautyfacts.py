"""
Open Beauty Facts API Integration Service
Official Documentation: https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/scanning-cosmetics-pet-food-and-other-products/
"""
import httpx
from typing import Dict, List, Optional, Any
import asyncio

class OpenBeautyFactsClient:
    """Client for Open Beauty Facts API - No authentication required"""
    
    def __init__(self):
        # Base endpoints from official docs [citation:3][citation:5]
        self.BASE_URL = "https://world.openbeautyfacts.org/api/v2"
        self.UNIVERSAL_SCAN_URL = "https://world.openfoodfacts.org/api/v2/product"
        self.USER_AGENT = "CosmeticSafetyScanner/1.0 (contact: your-email@example.com)"
    
    async def get_product_by_barcode(self, barcode: str) -> Dict[str, Any]:
        """
        Primary method: Fetch cosmetic product by barcode
        Uses the dedicated Open Beauty Facts endpoint
        """
        url = f"{self.BASE_URL}/product/{barcode}.json"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers={"User-Agent": self.USER_AGENT},
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Official response structure [citation:10]
                if data.get("status") == 1:  # 1 = product found
                    return self._parse_product_data(data["product"])
                else:
                    return {"success": False, "error": "Product not found"}
                    
            except httpx.HTTPError as e:
                return {"success": False, "error": f"API request failed: {str(e)}"}
    
    async def universal_scan(self, barcode: str) -> Dict[str, Any]:
        """
        Advanced method: Auto-detects if product is cosmetic, food, or pet food
        Uses product_type=all parameter [citation:3][citation:5]
        """
        url = f"{self.UNIVERSAL_SCAN_URL}/{barcode}.json"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    params={"product_type": "all"},
                    headers={"User-Agent": self.USER_AGENT},
                    timeout=10.0,
                    follow_redirects=True  # Critical: API redirects to correct server [citation:3]
                )
                
                data = response.json()
                
                if data.get("status") == 1:
                    product = data.get("product", {})
                    # Check if it's actually a beauty product
                    product_type = product.get("product_type", "unknown")
                    
                    return {
                        "success": True,
                        "detected_type": product_type,
                        "data": self._parse_product_data(product)
                    }
                else:
                    return {"success": False, "error": "Product not found in any database"}
                    
            except httpx.HTTPError as e:
                return {"success": False, "error": f"Universal scan failed: {str(e)}"}
    
    async def search_by_ingredient(self, ingredient: str) -> Dict[str, Any]:
        """
        Find products containing a specific ingredient
        Official endpoint: /ingredient/[ingredient].json [citation:5][citation:8]
        """
        url = f"https://world.openbeautyfacts.org/ingredient/{ingredient}.json"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers={"User-Agent": self.USER_AGENT}
                )
                return response.json()
            except httpx.HTTPError as e:
                return {"error": str(e)}
    
    async def get_ingredient_taxonomy(self) -> Dict[str, Any]:
        """
        Get complete list of known cosmetic ingredients
        Official endpoint: /ingredients.json [citation:5][citation:8]
        """
        url = "https://world.openbeautyfacts.org/ingredients.json"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers={"User-Agent": self.USER_AGENT}
                )
                return response.json()
            except httpx.HTTPError as e:
                return {"error": str(e)}
    
    def _parse_product_data(self, product: Dict) -> Dict:
        """
        Extract relevant cosmetic safety data from API response
        Based on official data structure [citation:2][citation:5]
        """
        # Extract ingredients (most critical for your project)
        ingredients_text = product.get("ingredients_text", "")
        ingredients_tags = product.get("ingredients_tags", [])
        
        # Extract raw ingredient list if available
        ingredients_list = []
        if "ingredients" in product:
            for ing in product.get("ingredients", []):
                name = ing.get("text", ing.get("id", ""))
                if name:
                    ingredients_list.append(name)
        
        # If structured ingredients not available, fallback to text parsing
        if not ingredients_list and ingredients_text:
            # Simple split by commas (your OCR parser can improve this)
            ingredients_list = [i.strip() for i in ingredients_text.split(",") if i.strip()]
        
        # Extract Period After Opening (PAO) [citation:2]
        pao = product.get("periods_after_opening", "Unknown")
        pao_tags = product.get("periods_after_opening_tags", [])
        
        # Build standardized response
        return {
            "success": True,
            "source": "Open Beauty Facts",
            "barcode": product.get("code", ""),
            "product_name": product.get("product_name", "Unknown Product"),
            "brands": product.get("brands", "Unknown Brand"),
            "categories": product.get("categories", "").split(",") if product.get("categories") else [],
            "ingredients_text": ingredients_text,
            "ingredients_list": ingredients_list or ingredients_tags,
            "ingredients_count": len(ingredients_list or ingredients_tags),
            "period_after_opening": pao,
            "period_after_opening_tags": pao_tags,
            "image_url": product.get("image_url", product.get("image_front_url", "")),
            "raw_data": product  # Keep for debugging/evaluation
        }


# ==================== FASTAPI ROUTES ====================
# Add these to your main.py or create a new router

async def get_openbeautyfacts_routes(router):
    """Call this from main.py to add these endpoints"""
    
    @router.get("/api/beauty/lookup/{barcode}")
    async def lookup_beauty_product(barcode: str):
        """Fetch cosmetic product from Open Beauty Facts by barcode"""
        client = OpenBeautyFactsClient()
        result = await client.get_product_by_barcode(barcode)
        return result
    
    @router.get("/api/beauty/universal-scan/{barcode}")
    async def universal_product_scan(barcode: str):
        """Auto-detect product type and fetch from correct database"""
        client = OpenBeautyFactsClient()
        result = await client.universal_scan(barcode)
        return result
    
    @router.get("/api/beauty/ingredient/{ingredient}")
    async def search_by_ingredient(ingredient: str):
        """Find products containing specific ingredient"""
        client = OpenBeautyFactsClient()
        result = await client.search_by_ingredient(ingredient)
        return result