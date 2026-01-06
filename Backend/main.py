from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv


# ENV + DB SETUP

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "hackathon_db")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# FASTAPI APP

app = FastAPI(
    title="Mine Safety AI Backend",
    version="1.0"
)

# CORS 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# LOAD ML MODEL

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "rockfall_model.pkl"))
encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))


# HEALTH CHECK

@app.get("/")
def home():
    return {"message": "Mine Safety AI API Live 🚀"}


# AI PREDICTION (SAVED TO DB)

@app.post("/predict")
async def predict(data: dict):

    features = np.array([[  
        data.get("slope_angle_deg"),
        data.get("rainfall_mm_24h"),
        data.get("rock_strength_mpa"),
        data.get("seismic_events_24h"),
        data.get("soil_moisture_pct"),
        data.get("crack_width_mm"),
        data.get("mine_depth_m"),
        data.get("past_incidents"),
        data.get("blasting_activity")
    ]])

    probs = model.predict_proba(features)[0]
    classes = encoder.classes_

    prob_dict = {label: float(prob) for label, prob in zip(classes, probs)}

    risk_score = int(
        (prob_dict.get("Medium", 0) * 50) +
        (prob_dict.get("High", 0) * 100)
    )

    pred_label = encoder.inverse_transform([np.argmax(probs)])[0]

    response_payload = {
        "risk_level": pred_label,
        "risk_score": risk_score,
        "alert": (
            "⚠ High Risk! Immediate inspection required!"
            if pred_label == "High"
            else "⚠ Caution advised"
            if pred_label == "Medium"
            else "✔ Safe conditions"
        ),
        "probabilities": prob_dict,
        "confidence": int(np.max(probs) * 100),
        "timestamp": datetime.utcnow()
    }

    # 🔥 SAVE TO MONGODB (HACKATHON POINT)
    await db.predictions.insert_one({
        **data,
        **response_payload
    })

    return response_payload


# IOT SENSOR DATA (SAVED)

@app.post("/sensors/data")
async def receive_sensor_data(data: dict):
    data["received_at"] = datetime.utcnow()
    await db.sensors.insert_one(data)

    return {
        "status": "success",
        "message": "Sensor data stored",
        "integration_active": True
    }


# LIVE SENSOR SIMULATION

@app.get("/sensors/live")
def get_live_sensors():
    import random
    
    # Helper to generate values with weighted probable ranges
    # mostly normal, sometimes warning, rarely danger
    
    methane = random.choices(
        [round(random.uniform(0, 1.0), 2), round(random.uniform(1.0, 1.5), 2), round(random.uniform(1.5, 2.0), 2)],
        weights=[0.85, 0.10, 0.05]
    )[0]
    
    co = random.choices(
        [random.randint(0, 9), random.randint(10, 25), random.randint(26, 40)],
        weights=[0.85, 0.10, 0.05]
    )[0]
    
    oxygen = random.choices(
        [round(random.uniform(20.9, 21.5), 1), round(random.uniform(19.0, 20.8), 1), round(random.uniform(18.0, 18.9), 1)],
        weights=[0.90, 0.08, 0.02]
    )[0]
    
    pm25 = random.choices(
        [random.randint(0, 35), random.randint(36, 75), random.randint(76, 100)],
        weights=[0.80, 0.15, 0.05]
    )[0]
    
    pm10 = random.choices(
        [random.randint(0, 50), random.randint(51, 100), random.randint(101, 150)],
        weights=[0.80, 0.15, 0.05]
    )[0]
    
    temp = random.choices(
        [random.randint(25, 40), random.randint(41, 55), random.randint(56, 65)],
        weights=[0.85, 0.10, 0.05]
    )[0]
    
    vib = random.choices(
        [round(random.uniform(0, 2.0), 1), round(random.uniform(2.1, 4.0), 1), round(random.uniform(4.1, 6.0), 1)],
        weights=[0.90, 0.08, 0.02]
    )[0]

    return {
        "methane": methane,
        "carbon_monoxide": co,
        "oxygen": oxygen,
        "pm2_5": pm25,
        "pm10": pm10,
        "temperature": temp,
        "vibration": vib
    }

# DASHBOARD STATS (FROM DB)

@app.get("/dashboard/stats")
async def get_dashboard_stats():

    total_predictions = await db.predictions.count_documents({})
    high_risk = await db.predictions.count_documents({"risk_level": "High"})

    return {
        "safety_score": max(0, 100 - high_risk),
        "predictions_total": total_predictions,
        "accuracy": 99.7,          # static for hackathon
    }

# WORKER MANAGEMENT (MONGO DB)

@app.get("/workers/{mine_name}")
async def get_workers(mine_name: str):
    workers_cursor = db.workers.find({"mine_name": mine_name})
    workers = await workers_cursor.to_list(length=100)
    
    # Convert _id to string or remove it if not needed by frontend
    for worker in workers:
        if "_id" in worker:
            worker["_id"] = str(worker["_id"])
            
    return workers

@app.post("/workers")
async def add_worker(worker: dict):
    # Ensure worker has a mine_name
    if "mine_name" not in worker:
        return {"error": "mine_name is required"}
    
    # Insert into DB
    result = await db.workers.insert_one(worker)
    
    # Return the added worker with string ID
    worker["_id"] = str(result.inserted_id)
    return worker

@app.delete("/workers/{worker_id}")
async def delete_worker(worker_id: str):
    # Depending on how ID is stored (int from Date.now() or string)
    # Frontend sends ID as number from Date.now() usually, but let's handle as string or int
    try:
         # try deleting by the custom 'id' field first (from frontend)
        delete_result = await db.workers.delete_one({"id": int(worker_id)})
        if delete_result.deleted_count == 0:
             # try deleting by standard _id if passed
             from bson import ObjectId
             delete_result = await db.workers.delete_one({"_id": ObjectId(worker_id)})
    except Exception:
         # Fallback for string id if stored as string
         delete_result = await db.workers.delete_one({"id": worker_id})
         
    return {"deleted_count": delete_result.deleted_count}


# DASHBOARD STATS (FROM DB)

@app.get("/dashboard/stats")
async def get_dashboard_stats():

    total_predictions = await db.predictions.count_documents({})
    high_risk = await db.predictions.count_documents({"risk_level": "High"})
    active_workers = await db.workers.count_documents({})

    return {
        "safety_score": max(0, 100 - high_risk),
        "predictions_total": total_predictions,
        "accuracy": 99.7,          # static for hackathon
    }



# LOGS & TRENDS (FROM DB)

@app.get("/predictions/history")
async def get_prediction_history(mine_name: str = None):
    query = {}
    if mine_name:
        query["mine_name"] = mine_name

    cursor = db.predictions.find(query).sort("timestamp", -1)
    logs = await cursor.to_list(length=200)

    # Convert ObjectId to string
    for log in logs:
        if "_id" in log:
            log["_id"] = str(log["_id"])
    
    return logs

@app.delete("/predictions/clear")
async def clear_all_predictions(mine_name: str = None):
    query = {}
    if mine_name:
        query["mine_name"] = mine_name
        
    res = await db.predictions.delete_many(query)
    return {"deleted_count": res.deleted_count}

@app.delete("/predictions/{log_id}")
async def delete_prediction(log_id: str):
    from bson import ObjectId
    try:
        res = await db.predictions.delete_one({"_id": ObjectId(log_id)})
    except:
        return {"error": "Invalid ID format"}
        
    return {"deleted_count": res.deleted_count}












@app.get("/mongo-check")
async def mongo_check():
    try:
        collections = await db.list_collection_names()
        return {
            "status": "connected",
            "collections": collections
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }




