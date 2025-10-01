import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Database, Activity, Map, BarChart3, Layers, FileSearch, Settings, Play, Pause, RotateCw } from 'lucide-react';
import * as THREE from 'three';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DigitalTwinPlatform = () => {
  const [activeTab, setActiveTab] = useState('3d-view');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [viewMode, setViewMode] = useState('full');
  const [isRotating, setIsRotating] = useState(true);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);

  const assetData = [
    { name: 'Sidewalks', detected: 3245, verified: 3180, accuracy: 98 },
    { name: 'Curb Ramps', detected: 892, verified: 821, accuracy: 92 },
    { name: 'Road Signs', detected: 2156, verified: 1987, accuracy: 92 },
    { name: 'Crosswalks', detected: 456, verified: 428, accuracy: 94 },
    { name: 'Traffic Lights', detected: 234, verified: 221, accuracy: 94 },
    { name: 'Fire Hydrants', detected: 678, verified: 655, accuracy: 97 }
  ];

  const performanceData = [
    { metric: 'Load Time', value: 420, unit: 'ms', target: 500 },
    { metric: 'FPS', value: 60, unit: 'fps', target: 60 },
    { metric: 'Points Rendered', value: 52, unit: 'M', target: 50 },
    { metric: 'API Latency', value: 85, unit: 'ms', target: 100 }
  ];

  const coverageData = [
    { area: 'Downtown', miles: 15, status: 'Complete', assets: 2340 },
    { area: 'Highway', miles: 32, status: 'Complete', assets: 4567 },
    { area: 'Residential', miles: 28, status: 'Processing', assets: 1890 },
    { area: 'Industrial', miles: 18, status: 'Complete', assets: 1234 },
    { area: 'Waterfront', miles: 12, status: 'Pending', assets: 890 }
  ];

  const detectionAccuracy = [
    { category: 'Excellent (>95%)', count: 4234, color: '#10b981' },
    { category: 'Good (90-95%)', count: 3456, color: '#3b82f6' },
    { category: 'Fair (85-90%)', count: 1234, color: '#f59e0b' },
    { category: 'Review (<85%)', count: 567, color: '#ef4444' }
  ];

  const crashOverlay = [
    { month: 'Jan', crashes: 12, severity: 2.3 },
    { month: 'Feb', crashes: 8, severity: 1.8 },
    { month: 'Mar', crashes: 15, severity: 2.7 },
    { month: 'Apr', crashes: 10, severity: 2.1 },
    { month: 'May', crashes: 14, severity: 2.5 },
    { month: 'Jun', crashes: 11, severity: 2.2 }
  ];

  useEffect(() => {
    if (!mountRef.current || activeTab !== '3d-view') return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 50, 200);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(30, 25, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.3);
    scene.add(hemiLight);

    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    for (let i = -40; i <= 40; i += 20) {
      const laneGeometry = new THREE.PlaneGeometry(2, 100);
      const laneMaterial = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.6
      });
      const lane = new THREE.Mesh(laneGeometry, laneMaterial);
      lane.rotation.x = -Math.PI / 2;
      lane.position.set(i, 0.01, 0);
      scene.add(lane);
    }

    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 50000;
    const positions = new Float32Array(pointsCount * 3);
    const colors = new Float32Array(pointsCount * 3);

    for (let i = 0; i < pointsCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 40 + 5;
      const theta = Math.random() * Math.PI * 2;
      const height = Math.random() * 15;

      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(theta) * radius;

      const color = new THREE.Color();
      color.setHSL(height / 20, 0.7, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const pointCloud = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointCloud);

    const assetPositions = [
      { pos: [10, 0, 10], type: 'sign', color: 0x3b82f6 },
      { pos: [-15, 0, 8], type: 'sign', color: 0x3b82f6 },
      { pos: [8, 0, -12], type: 'light', color: 0xfbbf24 },
      { pos: [-10, 0, -15], type: 'light', color: 0xfbbf24 },
      { pos: [20, 0, 5], type: 'hydrant', color: 0xef4444 },
      { pos: [-20, 0, -8], type: 'hydrant', color: 0xef4444 }
    ];

    assetPositions.forEach(asset => {
      const group = new THREE.Group();
      
      if (asset.type === 'sign') {
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 1.5;
        pole.castShadow = true;
        group.add(pole);

        const signGeo = new THREE.BoxGeometry(1.5, 1, 0.1);
        const signMat = new THREE.MeshStandardMaterial({ color: asset.color });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.y = 3.5;
        sign.castShadow = true;
        group.add(sign);
      } else if (asset.type === 'light') {
        const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 5, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2.5;
        pole.castShadow = true;
        group.add(pole);

        const lightGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const lightMat = new THREE.MeshStandardMaterial({
          color: asset.color,
          emissive: asset.color,
          emissiveIntensity: 0.5
        });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.y = 5.2;
        group.add(light);
      } else if (asset.type === 'hydrant') {
        const baseGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
        const baseMat = new THREE.MeshStandardMaterial({ color: asset.color });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.5;
        base.castShadow = true;
        group.add(base);
      }

      group.position.set(...asset.pos);
      scene.add(group);
    });

    const crashPositions = [
      [5, 0.5, -8],
      [-12, 0.5, 12],
      [18, 0.5, -5]
    ];

    crashPositions.forEach(pos => {
      const markerGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const markerMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(...pos);
      scene.add(marker);

      const ringGeo = new THREE.TorusGeometry(0.8, 0.05, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.3
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(...pos);
      scene.add(ring);
    });

    const gridHelper = new THREE.GridHelper(100, 50, 0x334155, 0x1e293b);
    scene.add(gridHelper);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (isRotating) {
        camera.position.x = Math.cos(Date.now() * 0.0001) * 40;
        camera.position.z = Math.sin(Date.now() * 0.0001) * 40;
        camera.lookAt(0, 5, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeTab, isRotating]);

  const runDetection = () => {
    setIsProcessing(true);
    setDetectionProgress(0);
    const interval = setInterval(() => {
      setDetectionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white overflow-hidden flex flex-col">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Digital Twin Infrastructure Platform</h1>
              <p className="text-sm text-slate-400">LiDAR | AI Detection | Spatial Analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Coverage</div>
              <div className="text-lg font-bold text-green-400">105.2 miles</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Assets Detected</div>
              <div className="text-lg font-bold text-blue-400">10,491</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Accuracy</div>
              <div className="text-lg font-bold text-purple-400">92%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border-b border-slate-700 px-6">
        <div className="flex space-x-1">
          {[
            { id: '3d-view', label: '3D View', icon: Camera },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'assets', label: 'Asset Inventory', icon: Database },
            { id: 'detection', label: 'AI Detection', icon: FileSearch }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === '3d-view' && (
          <div className="h-full relative">
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute top-4 right-4 space-y-2">
              <button
                onClick={() => setIsRotating(!isRotating)}
                className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg"
              >
                {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRotating ? 'Pause' : 'Rotate'}</span>
              </button>
              <button
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.set(30, 25, 30);
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg"
              >
                <RotateCw className="w-4 h-4" />
                <span>Reset View</span>
              </button>
            </div>
            <div className="absolute bottom-4 left-4 bg-slate-800 bg-opacity-95 p-4 rounded-lg shadow-lg max-w-md">
              <h3 className="font-bold mb-2 flex items-center space-x-2">
                <Map className="w-4 h-4 text-blue-400" />
                <span>Digital Twin Overview</span>
              </h3>
              <div className="text-sm space-y-1 text-slate-300">
                <p>• <span className="text-blue-400">Blue markers</span>: Road signs & signals</p>
                <p>• <span className="text-yellow-400">Yellow markers</span>: Traffic lights</p>
                <p>• <span className="text-red-400">Red markers</span>: Fire hydrants & crashes</p>
                <p>• <span className="text-purple-400">Point cloud</span>: 52M LiDAR points</p>
                <p className="text-xs text-slate-400 mt-2">Load time: 420ms | Rendering: 60 FPS</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {performanceData.map(metric => (
                <div key={metric.metric} className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">{metric.metric}</div>
                  <div className="text-2xl font-bold mt-1">
                    {metric.value}<span className="text-lg text-slate-400 ml-1">{metric.unit}</span>
                  </div>
                  <div className="text-xs text-green-400 mt-1">
                    Target: {metric.target}{metric.unit}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="font-bold mb-4">Crash Data Overlay (6 Months)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={crashOverlay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Legend />
                    <Line type="monotone" dataKey="crashes" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="severity" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="font-bold mb-4">Detection Quality Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={detectionAccuracy}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {detectionAccuracy.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="font-bold mb-4">Infrastructure Coverage by Area</h3>
              <div className="space-y-3">
                {coverageData.map(area => (
                  <div key={area.area} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{area.area}</span>
                        <span className="text-sm text-slate-400">
                          {area.miles} miles • {area.assets} assets
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            area.status === 'Complete' ? 'bg-green-500' :
                            area.status === 'Processing' ? 'bg-yellow-500' :
                            'bg-slate-500'
                          }`}
                          style={{ width: area.status === 'Complete' ? '100%' : '60%' }}
                        />
                      </div>
                    </div>
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs ${
                      area.status === 'Complete' ? 'bg-green-500/20 text-green-400' :
                      area.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {area.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="p-6">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="p-4 bg-slate-750 border-b border-slate-700">
                <h3 className="font-bold">Detected Assets Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Asset Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Detected</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Verified</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Accuracy</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {assetData.map(asset => (
                      <tr key={asset.name} className="hover:bg-slate-750 cursor-pointer" onClick={() => setSelectedAsset(asset)}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{asset.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{asset.detected.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{asset.verified.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            asset.accuracy >= 95 ? 'bg-green-500/20 text-green-400' :
                            asset.accuracy >= 90 ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {asset.accuracy}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Activity className="w-4 h-4 text-green-400 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 bg-slate-800 p-6 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  <Legend />
                  <Bar dataKey="detected" fill="#3b82f6" />
                  <Bar dataKey="verified" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'detection' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="font-bold mb-4 flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  <span>Upload LiDAR Data</span>
                </h3>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                  <p className="text-sm text-slate-400">Drop LAS/LAZ files here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                </div>
                <div className="mt-4 text-xs text-slate-400">
                  Supported formats: LAS, LAZ, E57<br/>
                  Max size: 10GB per file
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="font-bold mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span>AI Model Configuration</span>
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked className="rounded" readOnly />
                    <span className="text-sm">YOLOv8 (Primary)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked className="rounded" readOnly />
                    <span className="text-sm">Sign Detector</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked className="rounded" readOnly />
                    <span className="text-sm">Sidewalk Extractor</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" readOnly />
                    <span className="text-sm">Custom CV Model</span>
                  </label>
                </div>
                <button
                  onClick={runDetection}
                  disabled={isProcessing}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Run Detection'}
                </button>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="font-bold mb-4 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span>Processing Status</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Detection Progress</span>
                      <span>{detectionProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${detectionProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Files Processed</span>
                      <span>128 / 135</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assets Found</span>
                      <span className="text-green-400">10,491</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg. Confidence</span>
                      <span className="text-blue-400">94.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="font-bold mb-4">Recent Detection Results</h3>
              <div className="space-y-2">
                {[
                  { file: 'downtown_sector_a.las', assets: 1234, time: '2.3s', status: 'Complete' },
                  { file: 'highway_interchange.las', assets: 892, time: '1.8s', status: 'Complete' },
                  { file: 'residential_zone.las', assets: 2156, time: '3.1s', status: 'Processing' },
                  { file: 'waterfront_area.las', assets: 0, time: '-', status: 'Queued' }
                ].map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-750 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileSearch className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-medium">{result.file}</div>
                        <div className="text-xs text-slate-400">
                          {result.assets > 0 && `${result.assets} assets • `}Processing time: {result.time}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      result.status === 'Complete' ? 'bg-green-500/20 text-green-400' :
                      result.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 border-t border-slate-700 px-6 py-2 text-xs text-slate-400 flex justify-between">
        <div>System Status: <span className="text-green-400">● Online</span> | API Latency: 85ms</div>
        <div>Last Updated: {new Date().toLocaleTimeString()} | v1.0.0</div>
      </div>
    </div>
  );
};

export default DigitalTwinPlatform;
