import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { lidarAPI } from '../services/api';

const LidarUpload = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', 'default-project');

    setUploading(true);
    try {
      const response = await lidarAPI.upload(formData);
      onUploadComplete(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    
      
      
      
        
          {uploading ? `Uploading... ${progress}%` : 'Drop LAS/LAZ files here or click to browse'}
        
      
    
  );
};

export default LidarUpload;
