from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os
import math

app = FastAPI(title="Grocery Shop ML Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
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

class DemandForecastRequest(BaseModel):
    productData: List[ProductData]

class AnomalyDetectionRequest(BaseModel):
    salesData: List[SalesDataPoint]

class PriceOptimizationRequest(BaseModel):
    productData: ProductData

class RestockRequest(BaseModel):
    inventoryData: List[ProductData]

# Pure Python statistical functions
def mean(data):
    if not data:
        return 0
    return sum(data) / len(data)

def std_dev(data):
    if len(data) < 2:
        return 0
    avg = mean(data)
    variance = sum((x - avg) ** 2 for x in data) / len(data)
    return math.sqrt(variance)

def percentile(data, p):
    if not data:
        return 0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * p / 100
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_data[int(k)]
    return sorted_data[int(f)] * (c - k) + sorted_data[int(c)] * (k - f)

# Simple Linear Regression implementation
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

# Simple Isolation Forest implementation
class SimpleIsolationForest:
    def __init__(self, contamination=0.1):
        self.contamination = contamination
        self.threshold = None
    
    def fit_predict(self, data):
        if len(data) < 5:
            return [1] * len(data)
        
        # Calculate mean and std
        avg = mean(data)
        std = std_dev(data)
        
        if std == 0:
            return [1] * len(data)
        
        # Z-score based anomaly detection
        z_scores = [abs((x - avg) / std) for x in data]
        threshold = percentile(z_scores, (1 - self.contamination) * 100)
        
        return [1 if z < threshold else -1 for z in z_scores]

@app.get("/")
async def root():
    return {"message": "ML Service is running", "status": "OK"}

@app.post("/predict/sales")
async def predict_sales(request: SalesPredictionRequest):
    """Predict sales for the next N days using Linear Regression"""
    try:
        if len(request.historicalData) < 3:
            # Return simple average if not enough data
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
        
        # Prepare data
        X = [i for i in range(len(request.historicalData))]
        y = [d.total for d in request.historicalData]
        
        # Train model
        model = SimpleLinearRegression()
        model.fit(X, y)
        
        # Make predictions
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

@app.post("/predict/demand")
async def predict_demand(request: DemandForecastRequest):
    """Forecast demand for products"""
    try:
        forecasts = []
        
        for product in request.productData:
            # Simple demand forecasting based on stock levels and thresholds
            stock_ratio = product.stock / max(product.lowStockThreshold, 1)
            
            if stock_ratio < 0.5:
                demand_level = "high"
                recommended_order = product.lowStockThreshold * 3
            elif stock_ratio < 1.0:
                demand_level = "medium"
                recommended_order = product.lowStockThreshold * 2
            else:
                demand_level = "low"
                recommended_order = product.lowStockThreshold
            
            forecasts.append({
                "product": product.name,
                "current_stock": product.stock,
                "demand_level": demand_level,
                "recommended_order_quantity": recommended_order,
                "priority_score": round(1 / stock_ratio, 2) if stock_ratio > 0 else 10
            })
        
        # Sort by priority
        forecasts.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return {"forecasts": forecasts}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/anomaly")
async def detect_anomalies(request: AnomalyDetectionRequest):
    """Detect anomalies in sales data"""
    try:
        if len(request.salesData) < 5:
            return {"anomalies": [], "message": "Not enough data for anomaly detection"}
        
        # Prepare data
        sales_values = [d.total for d in request.salesData]
        
        # Apply simple anomaly detection
        iso_forest = SimpleIsolationForest(contamination=0.1)
        predictions = iso_forest.fit_predict(sales_values)
        
        anomalies = []
        for i, (data_point, pred) in enumerate(zip(request.salesData, predictions)):
            if pred == -1:  # Anomaly detected
                anomalies.append({
                    "date": data_point._id,
                    "sales": data_point.total,
                    "type": "unusual_sales",
                    "severity": "medium"
                })
        
        return {
            "anomalies": anomalies,
            "total_checked": len(request.salesData),
            "anomaly_count": len(anomalies)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize/price")
async def optimize_price(request: PriceOptimizationRequest):
    """Suggest optimal pricing based on demand elasticity"""
    try:
        product = request.productData
        
        # Simple price optimization logic
        stock_ratio = product.stock / max(product.lowStockThreshold, 1)
        
        if stock_ratio > 3:  # Overstocked
            suggested_discount = min(20, (stock_ratio - 3) * 5)
            recommendation = {
                "current_price": product.price,
                "suggested_price": round(product.price * (1 - suggested_discount/100), 2),
                "discount_percentage": round(suggested_discount, 1),
                "reason": "High inventory levels suggest promotional pricing",
                "expected_impact": "Increase sales velocity"
            }
        elif stock_ratio < 0.5:  # Understocked/high demand
            suggested_increase = min(15, (0.5 - stock_ratio) * 20)
            recommendation = {
                "current_price": product.price,
                "suggested_price": round(product.price * (1 + suggested_increase/100), 2),
                "increase_percentage": round(suggested_increase, 1),
                "reason": "Low stock suggests high demand",
                "expected_impact": "Maximize revenue on limited stock"
            }
        else:
            recommendation = {
                "current_price": product.price,
                "suggested_price": product.price,
                "change": 0,
                "reason": "Stock levels are balanced",
                "expected_impact": "Maintain current pricing"
            }
        
        return recommendation
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/restock")
async def restock_recommendations(request: RestockRequest):
    """Generate ML-based restock recommendations"""
    try:
        recommendations = []
        
        for product in request.inventoryData:
            stock_ratio = product.stock / max(product.lowStockThreshold, 1)
            
            # Calculate priority score
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
            
            # Estimate investment required
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
        
        # Sort by priority
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5001))
    uvicorn.run(app, host="0.0.0.0", port=port)
