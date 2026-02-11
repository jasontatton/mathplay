// src/games/threebodyproblem/components/VelocityVector.tsx

import React, {useEffect, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {magnitude, normalize} from '../utils/physics';
import {getPhysicsState} from '../hooks/useSimulation';

interface VelocityVectorProps {
    bodyId: string;
}

export const VelocityVector: React.FC<VelocityVectorProps> = ({bodyId}) => {
    const {scene} = useThree();
    const groupRef = useRef<THREE.Group | null>(null);
    const lineRef = useRef<THREE.Line | null>(null);
    const coneRef = useRef<THREE.Mesh | null>(null);

    const scale = 0.5;

    useEffect(() => {
        // Create group
        const group = new THREE.Group();

        // Create line
        const lineGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6); // 2 points * 3 coordinates
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);

        // Create cone (arrow head)
        const coneGeometry = new THREE.ConeGeometry(0.03, 0.08, 8);
        const coneMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        group.add(cone);

        scene.add(group);

        groupRef.current = group;
        lineRef.current = line;
        coneRef.current = cone;

        return () => {
            scene.remove(group);
            lineGeometry.dispose();
            lineMaterial.dispose();
            coneGeometry.dispose();
            coneMaterial.dispose();
        };
    }, [scene]);

    useFrame(() => {
        if (!groupRef.current || !lineRef.current || !coneRef.current) return;

        const physicsState = getPhysicsState();
        const body = physicsState.bodies.find((b) => b.id === bodyId);

        if (!body) {
            groupRef.current.visible = false;
            return;
        }

        const vel = body.velocity;
        const speed = magnitude(vel);

        if (speed < 0.01) {
            groupRef.current.visible = false;
            return;
        }

        groupRef.current.visible = true;

        const dir = normalize(vel);
        const endX = body.position.x + vel.x * scale;
        const endY = body.position.y + vel.y * scale;
        const endZ = body.position.z + vel.z * scale;

        // Update line positions
        const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
        positions[0] = body.position.x;
        positions[1] = body.position.y;
        positions[2] = body.position.z;
        positions[3] = endX;
        positions[4] = endY;
        positions[5] = endZ;
        lineRef.current.geometry.attributes.position.needsUpdate = true;

        // Update cone position and rotation
        coneRef.current.position.set(endX, endY, endZ);
        const direction = new THREE.Vector3(dir.x, dir.y, dir.z);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        coneRef.current.quaternion.copy(quaternion);
    });

    return null;
};