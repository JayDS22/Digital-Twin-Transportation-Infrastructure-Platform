from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging
from detection.yolo_detector import YOLODetector
from processors.lidar_processor import LiDARProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Digital Twin AI Service")

yolo_detector = YOLODetector()
lidar_processor = LiDARProcessor()

class DetectionRequest(BaseModel):
    lidar_id: str
    models: List[str]

class DetectionResponse(BaseModel):
    job_id: str
    status: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": yolo_detector.is_loaded}

@app.post("/detect", response_model=DetectionResponse)
async def run_detection(request: DetectionRequest, background_tasks: BackgroundTasks):
    try:
        job_id = f"job_{request.lidar_id}_{int(time.time())}"
        background_tasks.add_task(process_detection, job_id, request)
        return DetectionResponse(job_id=job_id, status="queued")
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_detection(job_id: str, request: DetectionRequest):
    try:
        # Load LiDAR data
        point_cloud = lidar_processor.load_file(request.lidar_id)
        
        # Run detection models
        results = {}
        for model_name in request.models:
            if model_name == "yolov8":
                results[model_name] = yolo_detector.detect(point_cloud)
        
        # Save results to database
        save_detection_results(job_id, results)
        
        logger.info(f"Detection completed for job {job_id}")
    except Exception as e:
        logger.error(f"Processing error for job {job_id}: {str(e)}")

def save_detection_results(job_id: str, results: dict):
    # Implementation for saving to database
    pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
