// src/games/threebodyproblem/components/BodyTrail.tsx

import React, {useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import * as THREE from 'three';
import {getPhysicsState} from '../hooks/useSimulation';
import {Vector3D} from '../types/types';

interface BodyTrailProps {
    bodyId: string;
    color: string;
}

export const BodyTrail: React.FC<BodyTrailProps> = ({bodyId, color}) => {
    const [points, setPoints] = useState<THREE.Vector3[]>([]);

    useFrame(() => {
        const physicsState = getPhysicsState();
        const trail = physicsState.trails[bodyId] || [];

        if (trail.length >= 2) {
            // Only update every few frames to reduce overhead
            const newPoints = trail.map((p: Vector3D) => new THREE.Vector3(p.x, p.y, p.z));
            setPoints(newPoints);
        }
    });

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