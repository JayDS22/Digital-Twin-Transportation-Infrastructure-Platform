import numpy as np
from ultralytics import YOLO
import logging

logger = logging.getLogger(__name__)

class YOLODetector:
    def __init__(self, model_path='yolov8n.pt'):
        try:
            self.model = YOLO(model_path)
            self.is_loaded = True
            logger.info("YOLOv8 model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {str(e)}")
            self.is_loaded = False
    
    def detect(self, point
