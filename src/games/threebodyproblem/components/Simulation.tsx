// src/games/threebodyproblem/components/Simulation.tsx

import React, {memo} from 'react';
import {useSimulationStore} from '../store/simulationStore';
import {useSimulation} from '../hooks/useSimulation';
import {BodyMesh} from './BodyMesh';
import {BodyTrail} from './BodyTrail';
import {VelocityVector} from './VelocityVector';
import {Grid} from './Grid';

const Bodies = memo(() => {
    const bodies = useSimulationStore((state) => state.bodies);
    return (
        <>
            {bodies.map((body) => (
                <BodyMesh key={body.id} body={body}/>
            ))}
        </>
    );
});

const Trails = memo(() => {
    const bodies = useSimulationStore((state) => state.bodies);
    const showTrails = useSimulationStore((state) => state.showTrails);

    if (!showTrails) return null;

    return (
        <>
            {bodies.map((body) => (
                <BodyTrail
                    key={`trail-${body.id}`}
                    bodyId={body.id}
                    color={body.trailColor}
                />
            ))}
        </>
    );
});

const Vectors = memo(() => {
    const bodies = useSimulationStore((state) => state.bodies);
    const showVectors = useSimulationStore((state) => state.showVectors);

    if (!showVectors) return null;

    return (
        <>
            {bodies.map((body) => (
                <VelocityVector key={`vel-${body.id}`} body={body}/>
            ))}
        </>
    );
});

export const Simulation: React.FC = () => {
    // Run the simulation physics
    useSimulation();

    return (
        <>
            <Grid/>
            <Bodies/>
            <Trails/>
            <Vectors/>
        </>
    );
};