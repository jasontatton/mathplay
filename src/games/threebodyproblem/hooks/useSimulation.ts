// src/games/threebodyproblem/hooks/useSimulation.ts

import {useEffect, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useSimulationStore} from '../store/simulationStore';
import {calculateStats, stepSimulation} from '../utils/physics';
import {Body, Vector3D} from '../types/types';

// Store physics state outside React
const physicsState = {
    bodies: [] as Body[],
    trails: {} as Record<string, Vector3D[]>,
    simulationTime: 0,
    fps: 0,
};

// FPS tracking
const fpsTracker = {
    frames: 0,
    lastTime: performance.now(),
    fps: 0,
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

        // Subscribe to state changes
        const unsubscribe = useSimulationStore.subscribe((state, prevState) => {
            // Reset physics state when bodies change externally (preset load, reset)
            if (state.bodies !== prevState.bodies && !state.isRunning) {
                physicsState.bodies = JSON.parse(JSON.stringify(state.bodies));
                physicsState.trails = {};
                physicsState.simulationTime = 0;
            }
        });

        return unsubscribe;
    }, []);

    useFrame((_, delta) => {
        // Update FPS
        fpsTracker.frames++;
        const now = performance.now();
        if (now - fpsTracker.lastTime >= 1000) {
            fpsTracker.fps = fpsTracker.frames;
            fpsTracker.frames = 0;
            fpsTracker.lastTime = now;
            physicsState.fps = fpsTracker.fps;
        }

        const store = useSimulationStore.getState();

        if (!store.isRunning) {
            // Sync bodies from store when paused (for manual edits)
            physicsState.bodies = JSON.parse(JSON.stringify(store.bodies));

            // Still update stats and FPS when paused
            lastStatsUpdate.current += delta;
            if (lastStatsUpdate.current > 0.1) {
                lastStatsUpdate.current = 0;

                const stats = calculateStats(
                    physicsState.bodies,
                    store.gravitationalConstant,
                    physicsState.simulationTime
                );

                useSimulationStore.setState({
                    stats,
                    simulationTime: physicsState.simulationTime,
                });
            }
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

        // Sync to store periodically
        lastStatsUpdate.current += clampedDelta;
        if (lastStatsUpdate.current > 0.1) {
            lastStatsUpdate.current = 0;

            // Calculate stats from physics state
            const stats = calculateStats(
                physicsState.bodies,
                gravitationalConstant,
                physicsState.simulationTime
            );

            useSimulationStore.setState({
                bodies: physicsState.bodies.map((b) => ({...b})),
                trails: {...physicsState.trails},
                simulationTime: physicsState.simulationTime,
                stats,
            });
        }
    });

    return physicsState;
};

export const getPhysicsState = () => physicsState;
export const getFPS = () => physicsState.fps;