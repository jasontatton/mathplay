import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { statsOverlayStyle } from '../styles/styles';
import { magnitude } from '../utils/physics';

export const StatsOverlay: React.FC = () => {
  const { stats, showStats, simulationTime } = useSimulationStore();

  if (!showStats) return null;

  const formatNumber = (n: number) => n.toFixed(4);
  const formatVector = (v: { x: number; y: number; z: number }) =>
    `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;

  return (
    <div style={statsOverlayStyle}>
      <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#4ecdc4' }}>
        Conservation Laws
      </div>
      <div>Time: {simulationTime.toFixed(2)}s</div>
      <div>Total Energy: {formatNumber(stats.totalEnergy)}</div>
      <div style={{ color: '#888', paddingLeft: 8 }}>
        KE: {formatNumber(stats.kineticEnergy)} | PE: {formatNumber(stats.potentialEnergy)}
      </div>
      <div>Momentum: {formatNumber(magnitude(stats.totalMomentum))}</div>
      <div style={{ color: '#888', paddingLeft: 8 }}>
        {formatVector(stats.totalMomentum)}
      </div>
      <div>Center of Mass: {formatVector(stats.centerOfMass)}</div>
    </div>
  );
};
