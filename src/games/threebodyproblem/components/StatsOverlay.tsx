// src/games/threebodyproblem/components/StatsOverlay.tsx

import React, {useEffect, useState} from 'react';
import {useSimulationStore} from '../store/simulationStore';
import {statsOverlayStyle} from '../styles/styles';
import {magnitude} from '../utils/physics';
import {getFPS} from '../hooks/useSimulation';

export const StatsOverlay: React.FC = () => {
    const {stats, showStats, simulationTime, isRunning} = useSimulationStore();
    const [fps, setFps] = useState(0);

    // Update FPS display periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setFps(getFPS());
        }, 500);

        return () => clearInterval(interval);
    }, []);

    if (!showStats) return null;

    const formatNumber = (n: number, decimals = 4) => {
        if (!isFinite(n)) return 'N/A';
        return n.toFixed(decimals);
    };

    const formatVector = (v: { x: number; y: number; z: number }) => {
        if (!v) return '(N/A)';
        return `(${formatNumber(v.x, 2)}, ${formatNumber(v.y, 2)}, ${formatNumber(v.z, 2)})`;
    };

    const momentumMag = magnitude(stats.totalMomentum);

    return (
        <div style={statsOverlayStyle}>
            {/* FPS */}
            <div
                style={{
                    marginBottom: 8,
                    padding: '4px 8px',
                    background: fps >= 55 ? '#2ecc71' : fps >= 30 ? '#f39c12' : '#e74c3c',
                    borderRadius: 4,
                    display: 'inline-block',
                    fontWeight: 'bold',
                }}
            >
                {fps} FPS
            </div>

            <div
                style={{
                    marginBottom: 8,
                    padding: '4px 8px',
                    background: isRunning ? '#4ecdc4' : '#888',
                    borderRadius: 4,
                    display: 'inline-block',
                    marginLeft: 8,
                }}
            >
                {isRunning ? '▶ Running' : '⏸ Paused'}
            </div>

            <div style={{marginTop: 8, marginBottom: 4, fontWeight: 'bold', color: '#4ecdc4'}}>
                Conservation Laws
            </div>

            <div style={{marginBottom: 4}}>
                <span style={{color: '#888'}}>Time:</span> {formatNumber(simulationTime, 2)}s
            </div>

            <div style={{marginBottom: 4}}>
                <span style={{color: '#888'}}>Total Energy:</span>{' '}
                <span style={{color: '#ffe66d'}}>{formatNumber(stats.totalEnergy)}</span>
            </div>

            <div style={{paddingLeft: 12, color: '#666', fontSize: 11, marginBottom: 4}}>
                KE: {formatNumber(stats.kineticEnergy)} | PE: {formatNumber(stats.potentialEnergy)}
            </div>

            <div style={{marginBottom: 4}}>
                <span style={{color: '#888'}}>Momentum:</span>{' '}
                <span style={{color: '#ff6b6b'}}>{formatNumber(momentumMag)}</span>
            </div>

            <div style={{paddingLeft: 12, color: '#666', fontSize: 11, marginBottom: 4}}>
                {formatVector(stats.totalMomentum)}
            </div>

            <div style={{marginBottom: 4}}>
                <span style={{color: '#888'}}>Center of Mass:</span>
            </div>

            <div style={{paddingLeft: 12, color: '#666', fontSize: 11}}>
                {formatVector(stats.centerOfMass)}
            </div>

            {/* Energy conservation indicator */}
            <div style={{marginTop: 8, paddingTop: 8, borderTop: '1px solid #333'}}>
        <span style={{color: '#888', fontSize: 11}}>
          💡 Energy & momentum should stay constant
        </span>
            </div>
        </div>
    );
};