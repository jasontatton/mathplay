// src/games/threebodyproblem/components/BodyTrail.tsx

import React, {useMemo} from 'react';
import {Line} from '@react-three/drei';
import * as THREE from 'three';
import {useSimulationStore} from '../store/simulationStore';

interface BodyTrailProps {
    bodyId: string;
    color: string;
}

export const BodyTrail: React.FC<BodyTrailProps> = ({bodyId, color}) => {
    const trail = useSimulationStore((state) => state.trails[bodyId]) || [];

    const points = useMemo(() => {
        if (trail.length < 2) return null;
        return trail.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    }, [trail]);

    if (!points || points.length < 2) return null;

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