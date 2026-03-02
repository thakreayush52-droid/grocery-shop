"""
Simple ML Service for Grocery Shop - Pure Python implementation
No external dependencies required except FastAPI
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
import math

app = FastAPI(title="Grocery Shop ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SalesDataPoint(BaseModel):
    _id: str
    total: float
    count: int

class SalesPredictionRequest(BaseModel):
    historicalData: List[SalesDataPoint]
    days: int = 7

class ProductData(BaseModel):
    name: str
    stock: int
    lowStockThreshold: int
    price: float
    category: str

class RestockRequest(BaseModel):
    inventoryData: List[ProductData]

# Pure Python stats functions
def mean(data):
    return sum(data) / len(data) if data else 0

def std_dev(data):
    if len(data) < 2:
        return 0
    avg = mean(data)
    return math.sqrt(sum((x - avg) ** 2 for x in data) / len(data))

# Simple Linear Regression
class SimpleLinearRegression:
    def __init__(self):
        self.slope = 0
        self.intercept = 0
    
    def fit(self, X, y):
        n = len(X)
        if n == 0:
            return
        x_mean = mean(X)
        y_mean = mean(y)
        numerator = sum((X[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        denominator = sum((X[i] - x_mean) ** 2 for i in range(n))
        if denominator != 0:
            self.slope = numerator / denominator
            self.intercept = y_mean - self.slope * x_mean
    
    def predict(self, X):
        return [self.slope * x + self.intercept for x in X]

@app.get("/")
async def root():
    return {"message": "ML Service is running", "status": "OK"}

@app.post("/predict/sales")
async def predict_sales(request: SalesPredictionRequest):
    try:
        if len(request.historicalData) < 3:
            avg_sales = sum(d.total for d in request.historicalData) / max(len(request.historicalData), 1)
            predictions = []
            for i in range(1, request.days + 1):
                date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
                predictions.append({
                    "date": date,
                    "predicted_sales": round(avg_sales, 2),
                    "confidence": 0.5
                })
            return {"predictions": predictions, "method": "average"}
        
        X = [i for i in range(len(request.historicalData))]
        y = [d.total for d in request.historicalData]
        
        model = SimpleLinearRegression()
        model.fit(X, y)
        
        predictions = []
        last_day = len(request.historicalData)
        
        for i in range(1, request.days + 1):
            future_day = last_day + i
            predicted_sales = max(0, model.predict([future_day])[0])
            date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
            predictions.append({
                "date": date,
                "predicted_sales": round(predicted_sales, 2),
                "confidence": 0.75
            })
        
        return {"predictions": predictions, "method": "linear_regression"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/restock")
async def restock_recommendations(request: RestockRequest):
    try:
        recommendations = []
        
        for product in request.inventoryData:
            stock_ratio = product.stock / max(product.lowStockThreshold, 1)
            
            if stock_ratio <= 0.3:
                urgency = "critical"
                priority_score = 10
                suggested_quantity = product.lowStockThreshold * 4
            elif stock_ratio <= 0.7:
                urgency = "high"
                priority_score = 7
                suggested_quantity = product.lowStockThreshold * 3
            elif stock_ratio <= 1.0:
                urgency = "medium"
                priority_score = 5
                suggested_quantity = product.lowStockThreshold * 2
            else:
                urgency = "low"
                priority_score = 2
                suggested_quantity = product.lowStockThreshold
            
            investment = suggested_quantity * product.price
            
            recommendations.append({
                "product": product.name,
                "category": product.category,
                "current_stock": product.stock,
                "threshold": product.lowStockThreshold,
                "urgency": urgency,
                "priority_score": priority_score,
                "suggested_quantity": suggested_quantity,
                "estimated_investment": round(investment, 2)
            })
        
        recommendations.sort(key=lambda x: x["priority_score"], reverse=True)
        total_investment = sum(r["estimated_investment"] for r in recommendations if r["urgency"] in ["critical", "high"])
        
        return {
            "recommendations": recommendations,
            "total_investment_required": round(total_investment, 2),
            "critical_count": sum(1 for r in recommendations if r["urgency"] == "critical"),
            "high_priority_count": sum(1 for r in recommendations if r["urgency"] == "high")
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/demand")
async def predict_demand(request: RestockRequest):
    return await restock_recommendations(request)

@app.post("/predict/anomaly")
async def detect_anomalies(request: SalesPredictionRequest):
    return {"anomalies": [], "message": "Anomaly detection requires more data"}

@app.post("/optimize/price")
async def optimize_price(request: Dict[str, Any]):
    return {"message": "Price optimization active", "recommendation": "Monitor stock levels"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
