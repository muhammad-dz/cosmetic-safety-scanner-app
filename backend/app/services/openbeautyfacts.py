"""
Open Beauty Facts API Integration Service
"""
import httpx
from typing import Dict, Any

class OpenBeautyFactsClient:
    """Client for Open Beauty Facts API - No authentication required"""

    def __init__(self):
        self.BASE_URL = "https://world.openbeautyfacts.org/api/v2"
        self.USER_AGENT = "CosmeticSafetyScanner/1.0"

    async def get_product_by_barcode(self, barcode: str) -> Dict[str, Any]:
        """Fetch cosmetic product by barcode"""
        url = f"{self.BASE_URL}/product/{barcode}.json"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers={"User-Agent": self.USER_AGENT},
                    timeout=10.0
                )
                data = response.json()

                if data.get("status") == 1:
                    product = data.get("product", {})
                    return {
                        "success": True,
                        "source": "Open Beauty Facts",
                        "barcode": product.get("code", barcode),
                        "product_name": product.get("product_name", "Unknown"),
                        "brands": product.get("brands", "Unknown"),
                        "ingredients_text": product.get("ingredients_text", ""),
                        "ingredients_list": product.get("ingredients_tags", []),
                    }
                else:
                    return {"success": False, "error": "Product not found"}
            except Exception as e:
                return {"success": False, "error": f"API request failed: {str(e)}"}

    async def universal_scan(self, barcode: str) -> Dict[str, Any]:
        """Auto-detect product type"""
        url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    params={"product_type": "all"},
                    headers={"User-Agent": self.USER_AGENT},
                    timeout=10.0
                )
                data = response.json()

                if data.get("status") == 1:
                    product = data.get("product", {})
                    return {
                        "success": True,
                        "detected_type": product.get("product_type", "unknown"),
                        "data": {
                            "product_name": product.get("product_name", "Unknown"),
                            "brands": product.get("brands", "Unknown"),
                            "ingredients_text": product.get("ingredients_text", "")
                        }
                    }
                else:
                    return {"success": False, "error": "Product not found"}
            except Exception as e:
                return {"success": False, "error": f"Universal scan failed: {str(e)}"}
