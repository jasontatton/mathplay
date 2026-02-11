// src/games/threebodyproblem/components/Simulation.tsx

import React, {useEffect, useState} from 'react';
import {useSimulationStore} from '../store/simulationStore';
import {useSimulation} from '../hooks/useSimulation';
import {BodyMesh} from './BodyMesh';
import {BodyTrail} from './BodyTrail';
import {VelocityVector} from './VelocityVector';
import {Grid} from './Grid';
import {Body} from '../types/types';

export const Simulation: React.FC = () => {
    // Initialize physics
    useSimulation();

    const [displayBodies, setDisplayBodies] = useState<Body[]>([]);
    const showTrails = useSimulationStore((state) => state.showTrails);
    const showVectors = useSimulationStore((state) => state.showVectors);

    useEffect(() => {
        // Get initial bodies
        setDisplayBodies(useSimulationStore.getState().bodies);

        // Track previous body IDs
        let prevIds = useSimulationStore.getState().bodies.map((b) => b.id).join(',');

        // Subscribe to all state changes
        const unsubscribe = useSimulationStore.subscribe((state) => {
            const currentIds = state.bodies.map((b) => b.id).join(',');

            // Only update display bodies when IDs change (not positions)
            if (currentIds !== prevIds) {
                prevIds = currentIds;
                setDisplayBodies(state.bodies);
            }
        });

        return unsubscribe;
    }, []);

    return (
        <>
            <Grid/>

            {displayBodies.map((body) => (
                <BodyMesh key={body.id} bodyId={body.id} initialBody={body}/>
            ))}

            {showTrails &&
                displayBodies.map((body) => (
                    <BodyTrail
                        key={`trail-${body.id}`}
                        bodyId={body.id}
                        color={body.trailColor}
                    />
                ))}

            {showVectors &&
                displayBodies.map((body) => (
                    <VelocityVector key={`vel-${body.id}`} bodyId={body.id}/>
                ))}
        </>
    );
};