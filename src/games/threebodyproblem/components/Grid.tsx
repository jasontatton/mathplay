import React from 'react';
import { useSimulationStore } from '../store/simulationStore';

export const Grid: React.FC = () => {
  const showGrid = useSimulationStore((state) => state.showGrid);
  const is3D = useSimulationStore((state) => state.is3D);

  if (!showGrid) return null;

  return (
    <>
      <gridHelper
        args={[20, 40, '#333333', '#1a1a1a']}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.01]}
      />
      {is3D && (
        <>
          <gridHelper
            args={[20, 40, '#222222', '#151515']}
            position={[0, -10, 0]}
          />
          <gridHelper
            args={[20, 40, '#222222', '#151515']}
            rotation={[0, 0, Math.PI / 2]}
            position={[-10, 0, 0]}
          />
        </>
      )}
    </>
  );
};
