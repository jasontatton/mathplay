// src/games/threebodyproblem/hooks/useSimulation.ts

import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useSimulationStore} from '../store/simulationStore';
import {stepSimulation} from '../utils/physics';

export const useSimulation = () => {
    const frameCount = useRef(0);
    const statsUpdateCounter = useRef(0);

    useFrame((_, delta) => {
        // Get state directly without subscribing
        const state = useSimulationStore.getState();

        if (!state.isRunning) return;

        const {
            bodies,
            speed,
            gravitationalConstant,
            showTrails,
            integrationMethod,
            trailLength,
        } = state;

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

        // Batch updates using direct state mutation via set
        useSimulationStore.setState({bodies: currentBodies});

        // Increment simulation time
        useSimulationStore.setState((s) => ({
            simulationTime: s.simulationTime + clampedDelta * speed,
        }));

        // Add trail points every few frames
        frameCount.current++;
        if (showTrails && frameCount.current % 3 === 0) {
            useSimulationStore.setState((s) => {
                const newTrails = {...s.trails};
                currentBodies.forEach((body) => {
                    const trail = newTrails[body.id] || [];
                    newTrails[body.id] = [...trail, {...body.position}].slice(-trailLength);
                });
                return {trails: newTrails};
            });
        }

        // Update stats every 30 frames
        statsUpdateCounter.current++;
        if (statsUpdateCounter.current % 30 === 0) {
            state.updateStats();
        }
    });
};