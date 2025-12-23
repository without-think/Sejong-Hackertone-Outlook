import React, { useEffect, useRef } from 'react';
import { MousePointer2 } from 'lucide-react';

/**
 * Three.js를 사용하여 시간 복잡도 곡선을 시각화하고 
 * 마우스 드래그로 회전 가능한 인터랙티브 그래프 컴포넌트입니다.
 */
const Complexity3DGraph = ({ isModal = false, highlightComplexity = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let renderer, animationId, handleResize;
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.onload = () => initThree();
    document.head.appendChild(script);

    function initThree() {
      if (!containerRef.current) return;
      const THREE = window.THREE;
      if (!THREE) return;
      
      const width = containerRef.current.clientWidth;
      const height = isModal ? 280 : 400;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isModal ? 0xffffff : 0xf9fafb);
      
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(12, 12, 22);
      camera.lookAt(0, 5, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      containerRef.current.appendChild(renderer.domElement);
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      
      const graphGroup = new THREE.Group();
      scene.add(graphGroup);

      const complexities = [
        { name: 'O(1)', color: 0x10b981, fn: (n) => 1 },
        { name: 'O(log n)', color: 0x3b82f6, fn: (n) => Math.log2(n + 1) },
        { name: 'O(n)', color: 0xf59e0b, fn: (n) => n },
        { name: 'O(n log n)', color: 0xef4444, fn: (n) => n * Math.log2(n + 1) },
        { name: 'O(n^2)', color: 0x8b5cf6, fn: (n) => n * n }
      ];

      complexities.forEach((comp, idx) => {
        const isHighlighted = String(highlightComplexity).toLowerCase() === comp.name.toLowerCase();
        const material = new THREE.LineBasicMaterial({ 
          color: comp.color, 
          linewidth: isHighlighted ? 5 : 1,
          transparent: true,
          opacity: highlightComplexity ? (isHighlighted ? 1.0 : 0.1) : 0.6
        });
        
        const points = [];
        for (let n = 0; n <= 10; n += 0.2) {
          const val = comp.fn(n);
          if (val < 25) {
            points.push(new THREE.Vector3(n * 2 - 10, val * 0.6 - 5, idx * 1.5 - 3));
          }
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        graphGroup.add(new THREE.Line(geometry, material));

        if (isHighlighted && points.length > 0) {
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.MeshBasicMaterial({ color: comp.color })
          );
          sphere.position.copy(points[points.length - 1]);
          graphGroup.add(sphere);
        }
      });

      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      const onMouseDown = () => { isDragging = true; };
      const onMouseMove = (event) => {
        if (!isDragging) return;
        const deltaMove = { x: event.offsetX - previousMousePosition.x, y: event.offsetY - previousMousePosition.y };
        const rotationQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(
            (deltaMove.y * Math.PI) / 180 * 0.5,
            (deltaMove.x * Math.PI) / 180 * 0.5,
            0, 'XYZ'
        ));
        graphGroup.quaternion.multiplyQuaternions(rotationQuaternion, graphGroup.quaternion);
        previousMousePosition = { x: event.offsetX, y: event.offsetY };
      };
      const onMouseUp = () => { isDragging = false; };

      containerRef.current.addEventListener('mousedown', onMouseDown);
      containerRef.current.addEventListener('mousemove', (e) => {
        if (!isDragging) previousMousePosition = { x: e.offsetX, y: e.offsetY };
        onMouseMove(e);
      });
      window.addEventListener('mouseup', onMouseUp);

      function animate() { 
        animationId = requestAnimationFrame(animate); 
        if (!isDragging) graphGroup.rotation.y += 0.005;
        if (renderer && scene && camera) renderer.render(scene, camera); 
      }
      animate();

      handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const w = containerRef.current.clientWidth;
        const h = isModal ? 280 : 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
    };
  }, [isModal, highlightComplexity]);

  return (
    <div className={`relative w-full ${isModal ? 'h-[280px]' : 'h-[400px]'} bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-inner cursor-grab active:cursor-grabbing`}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="bg-gray-900/5 backdrop-blur px-3 py-1.5 rounded-full border border-black/5 flex items-center gap-2">
            <MousePointer2 className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-sans">Drag to rotate</span>
        </div>
      </div>
    </div>
  );
};

export default Complexity3DGraph;