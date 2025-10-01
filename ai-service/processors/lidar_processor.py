import laspy
import numpy as np
import open3d as o3d
import logging

logger = logging.getLogger(__name__)

class LiDARProcessor:
    def __init__(self):
        self.supported_formats = ['.las', '.laz', '.e57']
    
    def load_file(self, file_path):
        """Load LiDAR file and extract point cloud"""
        try:
            logger.info(f"Loading LiDAR file: {file_path}")
            
            # Read LAS/LAZ file
            las = laspy.read(file_path)
            
            # Extract point coordinates
            points = np.vstack((las.x, las.y, las.z)).transpose()
            
            # Extract colors if available
            colors = None
            if hasattr(las, 'red'):
                colors = np.vstack((las.red, las.green, las.blue)).transpose()
                colors = colors / 65535.0  # Normalize to 0-1
            
            # Extract intensity
            intensity = las.intensity if hasattr(las, 'intensity') else None
            
            point_cloud = {
                'points': points,
                'colors': colors,
                'intensity': intensity,
                'count': len(points),
                'bounds': self._calculate_bounds(points)
            }
            
            logger.info(f"Loaded {len(points)} points")
            return point_cloud
            
        except Exception as e:
            logger.error(f"Error loading LiDAR file: {str(e)}")
            raise
    
    def downsample(self, point_cloud, voxel_size=0.1):
        """Downsample point cloud for faster processing"""
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(point_cloud['points'])
        
        if point_cloud['colors'] is not None:
            pcd.colors = o3d.utility.Vector3dVector(point_cloud['colors'])
        
        downsampled = pcd.voxel_down_sample(voxel_size=voxel_size)
        
        return {
            'points': np.asarray(downsampled.points),
            'colors': np.asarray(downsampled.colors) if downsampled.has_colors() else None,
            'count': len(downsampled.points)
        }
    
    def segment_ground(self, point_cloud):
        """Segment ground plane from point cloud"""
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(point_cloud['points'])
        
        # RANSAC plane segmentation
        plane_model, inliers = pcd.segment_plane(
            distance_threshold=0.2,
            ransac_n=3,
            num_iterations=1000
        )
        
        ground_cloud = pcd.select_by_index(inliers)
        object_cloud = pcd.select_by_index(inliers, invert=True)
        
        return {
            'ground': np.asarray(ground_cloud.points),
            'objects': np.asarray(object_cloud.points),
            'plane_model': plane_model
        }
    
    def generate_mesh(self, point_cloud):
        """Generate 3D mesh from point cloud"""
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(point_cloud['points'])
        
        if point_cloud['colors'] is not None:
            pcd.colors = o3d.utility.Vector3dVector(point_cloud['colors'])
        
        # Estimate normals
        pcd.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30)
        )
        
        # Poisson surface reconstruction
        mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
            pcd, depth=9
        )
        
        return {
            'vertices': np.asarray(mesh.vertices),
            'triangles': np.asarray(mesh.triangles),
            'vertex_colors': np.asarray(mesh.vertex_colors) if mesh.has_vertex_colors() else None
        }
    
    def _calculate_bounds(self, points):
        """Calculate bounding box of point cloud"""
        return {
            'min': points.min(axis=0).tolist(),
            'max': points.max(axis=0).tolist(),
            'center': points.mean(axis=0).tolist()
        }
