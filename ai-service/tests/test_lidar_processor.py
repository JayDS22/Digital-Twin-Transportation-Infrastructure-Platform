import pytest
import numpy as np
from processors.lidar_processor import LiDARProcessor

@pytest.fixture
def processor():
    return LiDARProcessor()

def test_bounds_calculation(processor):
    points = np.array([[0, 0, 0], [10, 10, 10], [5, 5, 5]])
    bounds = processor._calculate_bounds(points)
    
    assert bounds['min'] == [0, 0, 0]
    assert bounds['max'] == [10, 10, 10]
    assert bounds['center'][0] == pytest.approx(5.0)

def test_downsampling(processor):
    point_cloud = {
        'points': np.random.rand(10000, 3),
        'colors': None
    }
    
    downsampled = processor.downsample(point_cloud, voxel_size=0.5)
    assert downsampled['count'] < 10000
