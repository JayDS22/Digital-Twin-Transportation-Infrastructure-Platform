import React from 'react';
import { Activity } from 'lucide-react';

const AssetTable = ({ assets, onAssetClick }) => {
  return (
    
      
        
          
            
              Asset Type
            
            
              Detected
            
            
              Verified
            
            
              Accuracy
            
          
        
        
          {assets.map((asset) => (
            <tr
              key={asset.name}
              onClick={() => onAssetClick(asset)}
              className="hover:bg-slate-750 cursor-pointer"
            >
              
                {asset.name}
              
              
                {asset.detected.toLocaleString()}
              
              
                {asset.verified.toLocaleString()}
              
              
                = 95 ? 'bg-green-500/20 text-green-400' :
                  asset.accuracy >= 90 ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {asset.accuracy}%
                
              
            
          ))}
        
      
    
  );
};

export default AssetTable;
