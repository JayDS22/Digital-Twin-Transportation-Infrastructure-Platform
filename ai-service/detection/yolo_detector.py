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
    
def detect(self, point_cloud):
        """
        Detect infrastructure assets in point cloud data
        """
        if not self.is_loaded:
            raise Exception("YOLO model not loaded")
        
        try:
            # Convert point cloud to 2D projection for detection
            projection = self._create_projection(point_cloud)
            
            # Run YOLO detection
            results = self.model(projection, conf=0.5)
            
            # Parse results
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    detection = {
                        'class': result.names[int(box.cls)],
                        'confidence': float(box.conf),
                        'bbox': box.xyxy[0].tolist(),
                        'coordinates': self._map_to_3d(box.xyxy[0], point_cloud)
                    }
                    detections.append(detection)
            
            logger.info(f"Detected {len(detections)} objects")
            return detections
            
        except Exception as e:
            logger.error(f"Detection error: {str(e)}")
            raise
    
    def _create_projection(self, point_cloud):
        """Create 2D projection from 3D point cloud"""
        # Implementation for orthographic projection
        points = np.array(point_cloud['points'])
        
        # Create top-down view
        img_size = 1024
        x_min, x_max = points[:, 0].min(), points[:, 0].max()
        y_min, y_max = points[:, 1].min(), points[:, 1].max()
        
        projection = np.zeros((img_size, img_size, 3), dtype=np.uint8)
        
        # Map points to image coordinates
        x_norm = ((points[:, 0] - x_min) / (x_max - x_min) * (img_size - 1)).astype(int)
        y_norm = ((points[:, 1] - y_min) / (y_max - y_min) * (img_size - 1)).astype(int)
        
        # Color by height
        z_norm = ((points[:, 2] - points[:, 2].min()) / 
                  (points[:, 2].max() - points[:, 2].min()) * 255).astype(int)
        
        for i in range(len(points)):
            projection[y_norm[i], x_norm[i]] = [z_norm[i], z_norm[i], z_norm[i]]
        
        return projection
    
    def _map_to_3d(self, bbox, point_cloud):
        """Map 2D bounding box back to 3D coordinates"""
        # Implementation for reverse mapping
        return {
            'lat': 38.9897,  # Example coordinates
            'lon': -76.9378,
            'elevation': 50.0
        }
