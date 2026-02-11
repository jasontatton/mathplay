// src/games/threebodyproblem/components/BodyMesh.tsx

import React, {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Sphere} from '@react-three/drei';
import * as THREE from 'three';
import {Body} from '../types/types';
import {useSimulationStore} from '../store/simulationStore';
import {getPhysicsState} from '../hooks/useSimulation';

interface BodyMeshProps {
    bodyId: string;
    initialBody: Body;
}

export const BodyMesh: React.FC<BodyMeshProps> = ({bodyId, initialBody}) => {
    const groupRef = useRef<THREE.Group>(null);
    const bloomIntensity = useSimulationStore((state) => state.bloomIntensity);

    useFrame(() => {
        if (!groupRef.current) return;

        const physicsState = getPhysicsState();
        const body = physicsState.bodies.find((b) => b.id === bodyId);

        if (body) {
            groupRef.current.position.set(body.position.x, body.position.y, body.position.z);
        }
    });

    return (
        <group ref={groupRef} position={[initialBody.position.x, initialBody.position.y, initialBody.position.z]}>
            {/* Outer glow */}
            <Sphere args={[initialBody.radius * 2.5, 16, 16]}>
                <meshBasicMaterial
                    color={initialBody.color}
                    transparent
                    opacity={0.08 * bloomIntensity}
                    depthWrite={false}
                />
            </Sphere>
            {/* Middle glow */}
            <Sphere args={[initialBody.radius * 1.8, 16, 16]}>
                <meshBasicMaterial
                    color={initialBody.color}
                    transparent
                    opacity={0.15 * bloomIntensity}
                    depthWrite={false}
                />
            </Sphere>
            {/* Inner glow */}
            <Sphere args={[initialBody.radius * 1.3, 16, 16]}>
                <meshBasicMaterial
                    color={initialBody.color}
                    transparent
                    opacity={0.25 * bloomIntensity}
                    depthWrite={false}
                />
            </Sphere>
            {/* Main body */}
            <Sphere args={[initialBody.radius, 32, 32]}>
                <meshStandardMaterial
                    color={initialBody.color}
                    emissive={initialBody.color}
                    emissiveIntensity={0.8}
                />
            </Sphere>
        </group>
    );
};