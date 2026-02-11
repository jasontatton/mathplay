import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useSimulationStore} from '../store/simulationStore';
import {stepSimulation} from '../utils/physics';

export const useSimulation = () => {
    const {
        bodies,
        setBodies,
        isRunning,
        speed,
        gravitationalConstant,
        showTrails,
        integrationMethod,
        addTrailPoint,
        updateStats,
        incrementTime,
    } = useSimulationStore();

    const frameCount = useRef(0);
    const statsUpdateCounter = useRef(0);

    useFrame((_, delta) => {
        if (!isRunning) return;

        // Limit delta to prevent instability
        const clampedDelta = Math.min(delta, 0.05);

        // Run multiple physics steps per frame for accuracy
        const stepsPerFrame = 10;
        const dt = (clampedDelta * speed) / stepsPerFrame;

        let currentBodies = bodies;
        for (let i = 0; i < stepsPerFrame; i++) {
            currentBodies = stepSimulation(
                currentBodies,
                dt,
                gravitationalConstant,
                integrationMethod
            );
        }

        setBodies(currentBodies);
        incrementTime(clampedDelta * speed);

        // Add trail points every few frames
        frameCount.current++;
        if (showTrails && frameCount.current % 2 === 0) {
            currentBodies.forEach((body) => {
                addTrailPoint(body.id, body.position);
            });
        }

        // Update stats every 10 frames
        statsUpdateCounter.current++;
        if (statsUpdateCounter.current % 10 === 0) {
            updateStats();
        }
    });
};
