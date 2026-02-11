import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useSimulationStore } from '../store/simulationStore';
import { Simulation } from './Simulation';
import { StatsOverlay } from './StatsOverlay';
import { HelpOverlay } from './HelpOverlay';

export const SimulationCanvas: React.FC = () => {
  const is3D = useSimulationStore((state) => state.is3D);
  const bloomIntensity = useSimulationStore((state) => state.bloomIntensity);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: is3D ? [6, 6, 6] : [0, 0, 10], fov: 50 }}
        style={{ background: '#050508' }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />

          <Simulation />

          <OrbitControls
            enablePan
            enableZoom
            enableRotate={is3D}
            maxDistance={30}
            minDistance={2}
            panSpeed={0.5}
            zoomSpeed={0.8}
          />

          <EffectComposer>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              radius={0.8}
            />
          </EffectComposer>

          <color attach="background" args={['#050508']} />
        </Suspense>
      </Canvas>

      <StatsOverlay />
      <HelpOverlay />
    </div>
  );
};
