import React, { useRef } from 'react';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Body } from '../types/types';
import { useSimulationStore } from '../store/simulationStore';

interface BodyMeshProps {
  body: Body;
}

export const BodyMesh: React.FC<BodyMeshProps> = ({ body }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const bloomIntensity = useSimulationStore((state) => state.bloomIntensity);

  return (
    <group position={[body.position.x, body.position.y, body.position.z]}>
      {/* Outer glow */}
      <Sphere args={[body.radius * 2.5, 16, 16]}>
        <meshBasicMaterial
          color={body.color}
          transparent
          opacity={0.08 * bloomIntensity}
          depthWrite={false}
        />
      </Sphere>
      {/* Middle glow */}
      <Sphere args={[body.radius * 1.8, 16, 16]}>
        <meshBasicMaterial
          color={body.color}
          transparent
          opacity={0.15 * bloomIntensity}
          depthWrite={false}
        />
      </Sphere>
      {/* Inner glow */}
      <Sphere args={[body.radius * 1.3, 16, 16]}>
        <meshBasicMaterial
          color={body.color}
          transparent
          opacity={0.25 * bloomIntensity}
          depthWrite={false}
        />
      </Sphere>
      {/* Main body */}
      <Sphere ref={meshRef} args={[body.radius, 32, 32]}>
        <meshStandardMaterial
          color={body.color}
          emissive={body.color}
          emissiveIntensity={0.8}
        />
      </Sphere>
    </group>
  );
};
