import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

interface BodyTrailProps {
  bodyId: string;
  color: string;
}

export const BodyTrail: React.FC<BodyTrailProps> = ({ bodyId, color }) => {
  const trails = useSimulationStore((state) => state.trails);
  const trail = trails.get(bodyId) || [];

  const points = useMemo(() => {
    return trail.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  }, [trail]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.7}
    />
  );
};
