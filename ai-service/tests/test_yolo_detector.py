import pytest
import numpy as np
from detection.yolo_detector import YOLODetector

@pytest.fixture
def detector():
    return YOLODetector()

def test_detector_initialization(detector):
    assert detector.is_loaded == True
    assert detector.model is not None

def test_detection_with_sample_data(detector):
    # Create sample point cloud
    point_cloud = {
        'points': np.random.rand(1000, 3),
        'colors': None,
        'count': 1000
    }
    
    results = detector.detect(point_cloud)
    assert isinstance(results, list)

def test_projection_creation(detector):
    points = np.random.rand(100, 3)
    point_cloud = {'points': points}
    
    projection = detector._create_projection(point_cloud)
    assert projection.shape == (1024, 1024, 3)
    assert projection.dtype == np.uint8
