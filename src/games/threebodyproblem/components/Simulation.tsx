import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { useSimulation } from '../hooks/useSimulation';
import { BodyMesh } from './BodyMesh';
import { BodyTrail } from './BodyTrail';
import { VelocityVector } from './VelocityVector';
import { Grid } from './Grid';

export const Simulation: React.FC = () => {
  const { bodies, showTrails, showVectors } = useSimulationStore();

  // Run the simulation
  useSimulation();

  return (
    <>
      <Grid />

      {bodies.map((body) => (
        <BodyMesh key={body.id} body={body} />
      ))}

      {showTrails &&
        bodies.map((body) => (
          <BodyTrail
            key={`trail-${body.id}`}
            bodyId={body.id}
            color={body.trailColor}
          />
        ))}

      {showVectors &&
        bodies.map((body) => (
          <VelocityVector key={`vel-${body.id}`} body={body} />
        ))}
    </>
  );
};
