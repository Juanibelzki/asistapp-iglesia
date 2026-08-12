import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export function ThreeJSCursor() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const cursorMeshRef = useRef(null);
  const particlesRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const frameRef = useRef(0);

  const checkInteractiveElement = useCallback((event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const isInteractive = element && (
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.classList.contains('cursor-pointer') ||
      element.closest('button') ||
      element.closest('a') ||
      element.closest('[role="button"]')
    );
    setIsHovering(isInteractive);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with optimizations
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false, // Disable for performance
      powerPreference: "high-performance",
      precision: "lowp" // Lower precision for better performance
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.id = 'threejs-cursor-canvas';
    mountRef.current.appendChild(renderer.domElement);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    camera.position.z = 5;

    // Create optimized cursor sphere
    const geometry = new THREE.SphereGeometry(0.08, 16, 16); // Reduced geometry complexity
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x56CBD7,
      transparent: true,
      opacity: 0.7
    });
    const cursorMesh = new THREE.Mesh(geometry, material);
    scene.add(cursorMesh);
    cursorMeshRef.current = cursorMesh;

    // Create optimized particles (reduced count)
    const particleCount = 20; // Reduced from 50
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 1.5;
      particlePositions[i + 1] = (Math.random() - 0.5) * 1.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 0.5;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x56CBD7,
      size: 0.015, // Slightly smaller
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Optimized mouse move handler with throttling
    let lastMoveTime = 0;
    const handleMouseMove = (event) => {
      const now = Date.now();
      if (now - lastMoveTime < 16) return; // Throttle to ~60fps
      lastMoveTime = now;

      // Direct position update for better responsiveness
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Check interactive elements less frequently
      if (frameRef.current % 3 === 0) {
        checkInteractiveElement(event);
      }
    };

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Optimized animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      frameRef.current++;

      // Faster, more responsive cursor movement
      const lerpFactor = 0.2; // Increased from 0.1 for faster response
      targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * lerpFactor;
      targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * lerpFactor;

      if (cursorMeshRef.current) {
        // Direct position update for immediate response
        cursorMeshRef.current.position.x = targetRef.current.x * 1.8;
        cursorMeshRef.current.position.y = targetRef.current.y * 1.8;
        
        // Optimized scale effect
        const targetScale = isHovering ? 1.5 : 1;
        cursorMeshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
        
        // Simplified rotation
        cursorMeshRef.current.rotation.z += 0.02;
        
        // Optimized color change
        if (frameRef.current % 2 === 0) { // Update color less frequently
          const targetColor = isHovering ? 0xFF4343 : 0x56CBD7;
          cursorMeshRef.current.material.color.lerp(new THREE.Color(targetColor), 0.1);
        }
      }

      // Simplified particle animation (update less frequently)
      if (particlesRef.current && frameRef.current % 2 === 0) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          // Simplified attraction to cursor
          const dx = (targetRef.current.x * 1.8 - positions[i]) * 0.002;
          const dy = (targetRef.current.y * 1.8 - positions[i + 1]) * 0.002;
          
          positions[i] += dx;
          positions[i + 1] += dy;
          
          // Simple boundary check
          if (Math.abs(positions[i]) > 2) positions[i] *= 0.8;
          if (Math.abs(positions[i + 1]) > 2) positions[i + 1] *= 0.8;
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Simplified rotation
        particlesRef.current.rotation.z += 0.005;
      }

      renderer.render(scene, camera);
    };

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    animate();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        particlesRef.current.material.dispose();
      }
      if (cursorMeshRef.current) {
        cursorMeshRef.current.geometry.dispose();
        cursorMeshRef.current.material.dispose();
      }
      renderer.dispose();
    };
  }, [checkInteractiveElement, isHovering]);

  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{ 
        mixBlendMode: 'screen',
        filter: 'blur(0.3px)',
        willChange: 'transform'
      }}
    />
  );
}