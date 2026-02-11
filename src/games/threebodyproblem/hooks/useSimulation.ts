// src/games/threebodyproblem/hooks/useSimulation.ts

import {useEffect, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useSimulationStore} from '../store/simulationStore';
import {stepSimulation} from '../utils/physics';
import {Body, Vector3D} from '../types/types';

// Store physics state outside React
const physicsState = {
    bodies: [] as Body[],
    trails: {} as Record<string, Vector3D[]>,
    simulationTime: 0,
};

export const useSimulation = () => {
    const frameCount = useRef(0);
    const lastStatsUpdate = useRef(0);

    // Sync initial state from store
    useEffect(() => {
        const state = useSimulationStore.getState();
        physicsState.bodies = JSON.parse(JSON.stringify(state.bodies));
        physicsState.trails = {};
        physicsState.simulationTime = 0;

        // Subscribe to preset changes
        const unsubscribe = useSimulationStore.subscribe(
            (state, prevState) => {
                // Reset physics state when bodies change externally (preset load, reset)
                if (state.bodies !== prevState.bodies && !state.isRunning) {
                    physicsState.bodies = JSON.parse(JSON.stringify(state.bodies));
                    physicsState.trails = {};
                    physicsState.simulationTime = 0;
                }
            }
        );

        return unsubscribe;
    }, []);

    useFrame((_, delta) => {
        const store = useSimulationStore.getState();

        if (!store.isRunning) {
            // Sync bodies from store when paused (for manual edits)
            physicsState.bodies = JSON.parse(JSON.stringify(store.bodies));
            return;
        }

        const {speed, gravitationalConstant, integrationMethod, showTrails, trailLength} = store;

        // Limit delta to prevent instability
        const clampedDelta = Math.min(delta, 0.05);

        // Run multiple physics steps per frame
        const stepsPerFrame = 10;
        const dt = (clampedDelta * speed) / stepsPerFrame;

        for (let i = 0; i < stepsPerFrame; i++) {
            physicsState.bodies = stepSimulation(
                physicsState.bodies,
                dt,
                gravitationalConstant,
                integrationMethod
            );
        }

        physicsState.simulationTime += clampedDelta * speed;

        // Update trails
        frameCount.current++;
        if (showTrails && frameCount.current % 3 === 0) {
            physicsState.bodies.forEach((body) => {
                if (!physicsState.trails[body.id]) {
                    physicsState.trails[body.id] = [];
                }
                physicsState.trails[body.id].push({...body.position});
                if (physicsState.trails[body.id].length > trailLength) {
                    physicsState.trails[body.id] = physicsState.trails[body.id].slice(-trailLength);
                }
            });
        }

        // Sync to store less frequently (every 100ms worth of frames)
        lastStatsUpdate.current += clampedDelta;
        if (lastStatsUpdate.current > 0.1) {
            lastStatsUpdate.current = 0;

            // Batch update store
            useSimulationStore.setState({
                bodies: physicsState.bodies.map(b => ({...b})),
                trails: {...physicsState.trails},
                simulationTime: physicsState.simulationTime,
            }, false); // false = don't notify subscribers
        }
    });

    return physicsState;
};

export const getPhysicsState = () => physicsState;