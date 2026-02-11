import React from 'react';
import { Line, Cone } from '@react-three/drei';
import * as THREE from 'three';
import { Body } from '../types/types';
import { magnitude, normalize } from '../utils/physics';

interface VelocityVectorProps {
  body: Body;
}

export const VelocityVector: React.FC<VelocityVectorProps> = ({ body }) => {
  const scale = 0.5;
  const vel = body.velocity;
  const speed = magnitude(vel);

  if (speed < 0.01) return null;

  const dir = normalize(vel);
  const start = new THREE.Vector3(body.position.x, body.position.y, body.position.z);
  const end = new THREE.Vector3(
    body.position.x + vel.x * scale,
    body.position.y + vel.y * scale,
    body.position.z + vel.z * scale
  );

  // Calculate rotation for arrow head
  const direction = new THREE.Vector3(dir.x, dir.y, dir.z);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

  return (
    <group>
      <Line points={[start, end]} color="#ffffff" lineWidth={2} />
      <group position={end} quaternion={quaternion}>
        <Cone args={[0.03, 0.08, 8]} position={[0, 0.04, 0]}>
          <meshBasicMaterial color="#ffffff" />
        </Cone>
      </group>
    </group>
  );
};
