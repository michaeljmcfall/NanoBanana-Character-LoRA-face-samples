
import React, { useRef, useEffect, useMemo } from 'react';
import type { AngleX, AngleY } from '../types';

interface BackgroundCanvasProps {
  angleX: AngleX;
  angleY: AngleY;
}

// Simple Point class for 3D calculations
class Point {
  x: number;
  y: number;
  z: number;
  baseY: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.baseY = y;
  }
}

// Utility to map angle strings to rotation values (in radians)
const getTargetRotations = (angleX: AngleX, angleY: AngleY): { rotX: number; rotY: number } => {
    const xMap: Record<AngleX, number> = {
      'Profile Left': -90,
      'Three-Quarter Left': -60,
      'Slight Left': -30,
      'Front View': 0,
      'Slight Right': 30,
      'Three-Quarter Right': 60,
      'Profile Right': 90,
    };
    
    const yMap: Record<AngleY, number> = {
        'Tilted Up High': 30,
        'Tilted Up': 15,
        'Level View': 0,
        'Tilted Down': -15,
        'Tilted Down Low': -30,
    };

    return {
        rotX: (yMap[angleY] ?? 0) * (Math.PI / 180),
        rotY: (xMap[angleX] ?? 0) * (Math.PI / 180),
    };
};

const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ angleX, angleY }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // FIX: Initialize useRef with null to prevent type errors.
  const animationFrameIdRef = useRef<number | null>(null);
  const pointsRef = useRef<Point[]>([]);
  
  // Store current rotation for smooth transitions
  const rotationRef = useRef({ x: 0, y: 0 });

  const targetRotation = useMemo(() => getTargetRotations(angleX, angleY), [angleX, angleY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Grid properties
    const gridSize = 30;
    const spacing = 80;
    const waveAmplitude = 50;
    const perspective = 1000;
    const lineColor = 'rgba(107, 114, 128, 0.3)'; // gray-500 @ 30%
    const pointColor = 'rgba(156, 163, 175, 0.4)'; // gray-400 @ 40%
    
    // Initialize points if not already done
    if (pointsRef.current.length === 0) {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                pointsRef.current.push(new Point(
                    (i - gridSize / 2) * spacing,
                    0, // Y is controlled by wave
                    (j - gridSize / 2) * spacing
                ));
            }
        }
    }
    
    const points = pointsRef.current;

    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Smoothly interpolate rotation
      rotationRef.current.x = lerp(rotationRef.current.x, targetRotation.rotX, 0.05);
      rotationRef.current.y = lerp(rotationRef.current.y, targetRotation.rotY, 0.05);

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;
      
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = lineColor;
      ctx.fillStyle = pointColor;

      const projectedPoints: ({ x: number; y: number; scale: number, behind: boolean } | null)[] = [];

      points.forEach(point => {
        // Wave motion
        point.y = point.baseY + Math.sin(time + (point.x + point.z) * 0.005) * waveAmplitude;

        // 3D Rotation
        // Rotate Y
        let rotY_x = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
        let rotY_z = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
        // Rotate X
        let rotX_y = point.y * Math.cos(rotX) - rotY_z * Math.sin(rotX);
        let rotX_z = point.y * Math.sin(rotX) + rotY_z * Math.cos(rotX);
        
        const finalZ = rotX_z + gridSize * spacing * 0.5; // shift forward
        const scale = perspective / (perspective + finalZ);
        
        if (scale > 0) {
            projectedPoints.push({
                x: width / 2 + rotY_x * scale,
                y: height / 2 + rotX_y * scale,
                scale: scale,
                behind: false
            });
        } else {
             projectedPoints.push(null);
        }
      });

      // Draw lines and points
      for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
              const index = i * gridSize + j;
              const p1 = projectedPoints[index];

              if (p1) {
                  // Draw point
                  ctx.beginPath();
                  ctx.arc(p1.x, p1.y, 1 * p1.scale, 0, Math.PI * 2);
                  ctx.fill();

                  // Draw line to right neighbor
                  if (j < gridSize - 1) {
                      const p2 = projectedPoints[index + 1];
                      if (p2) {
                          ctx.beginPath();
                          ctx.moveTo(p1.x, p1.y);
                          ctx.lineTo(p2.x, p2.y);
                          ctx.stroke();
                      }
                  }
                  // Draw line to bottom neighbor
                  if (i < gridSize - 1) {
                      const p2 = projectedPoints[index + gridSize];
                      if (p2) {
                          ctx.beginPath();
                          ctx.moveTo(p1.x, p1.y);
                          ctx.lineTo(p2.x, p2.y);
                          ctx.stroke();
                      }
                  }
              }
          }
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        if (canvasRef.current) {
            canvasRef.current.width = width * window.devicePixelRatio;
            canvasRef.current.height = height * window.devicePixelRatio;
        }
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [targetRotation]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-gray-900" />;
};

export default BackgroundCanvas;
