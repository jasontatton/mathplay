// src/games/threebodyproblem/components/StatsOverlay.tsx

import React, {useEffect, useState} from 'react';
import {useSimulationStore} from '../store/simulationStore';
import {statsOverlayStyle} from '../styles/styles';
import {getFPS} from '../hooks/useSimulation';

export const StatsOverlay: React.FC = () => {
    const stats = useSimulationStore((state) => state.stats);
    const showStats = useSimulationStore((state) => state.showStats);
    const simulationTime = useSimulationStore((state) => state.simulationTime);
    const isRunning = useSimulationStore((state) => state.isRunning);
    const [fps, setFps] = useState(0);

    // Update FPS display periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setFps(getFPS());
        }, 250);

        return () => clearInterval(interval);
    }, []);

    if (!showStats) return null;

    const formatNumber = (n: number | undefined | null, decimals = 4): string => {
        if (n === undefined || n === null || !isFinite(n)) return '0.0000';
        return n.toFixed(decimals);
    };

    const formatVector = (v: { x: number; y: number; z: number } | undefined | null): string => {
        if (!v) return '(0, 0, 0)';
        const x = isFinite(v.x) ? v.x.toFixed(3) : '0';
        const y = isFinite(v.y) ? v.y.toFixed(3) : '0';
        const z = isFinite(v.z) ? v.z.toFixed(3) : '0';
        return `(${x}, ${y}, ${z})`;
    };

    const momentumMag = stats?.totalMomentum
        ? Math.sqrt(
            stats.totalMomentum.x * stats.totalMomentum.x +
            stats.totalMomentum.y * stats.totalMomentum.y +
            stats.totalMomentum.z * stats.totalMomentum.z
        )
        : 0;

    return (
        <div style={statsOverlayStyle}>
            {/* Status indicators */}
            <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
                <div
                    style={{
                        padding: '4px 10px',
                        background: fps >= 55 ? '#27ae60' : fps >= 30 ? '#f39c12' : '#e74c3c',
                        borderRadius: 4,
                        fontWeight: 'bold',
                        fontSize: 13,
                    }}
                >
                    {fps} FPS
                </div>
                <div
                    style={{
                        padding: '4px 10px',
                        background: isRunning ? '#4ecdc4' : '#7f8c8d',
                        borderRadius: 4,
                        fontWeight: 'bold',
                        fontSize: 13,
                    }}
                >
                    {isRunning ? '▶ Running' : '⏸ Paused'}
                </div>
            </div>

            {/* Time */}
            <div style={{marginBottom: 12, fontSize: 14}}>
                <span style={{color: '#888'}}>⏱ Time: </span>
                <span style={{color: '#fff', fontWeight: 'bold'}}>
          {formatNumber(simulationTime, 2)}s
        </span>
            </div>

            {/* Conservation Laws Header */}
            <div
                style={{
                    marginBottom: 8,
                    paddingBottom: 6,
                    borderBottom: '1px solid #444',
                    fontWeight: 'bold',
                    color: '#4ecdc4',
                    fontSize: 13,
                }}
            >
                ⚖️ Conservation Laws
            </div>

            {/* Energy */}
            <div style={{marginBottom: 8}}>
                <div style={{marginBottom: 2}}>
                    <span style={{color: '#888'}}>Total Energy: </span>
                    <span style={{color: '#ffe66d', fontWeight: 'bold'}}>
            {formatNumber(stats?.totalEnergy)}
          </span>
                </div>
                <div style={{paddingLeft: 12, color: '#666', fontSize: 11}}>
                    KE: {formatNumber(stats?.kineticEnergy)} | PE: {formatNumber(stats?.potentialEnergy)}
                </div>
            </div>

            {/* Momentum */}
            <div style={{marginBottom: 8}}>
                <div style={{marginBottom: 2}}>
                    <span style={{color: '#888'}}>Total Momentum: </span>
                    <span style={{color: '#ff6b6b', fontWeight: 'bold'}}>
            |p| = {formatNumber(momentumMag)}
          </span>
                </div>
                <div style={{paddingLeft: 12, color: '#666', fontSize: 11}}>
                    p = {formatVector(stats?.totalMomentum)}
                </div>
            </div>

            {/* Center of Mass */}
            <div style={{marginBottom: 8}}>
                <div style={{marginBottom: 2}}>
                    <span style={{color: '#888'}}>Center of Mass: </span>
                </div>
                <div style={{paddingLeft: 12, color: '#4ecdc4', fontSize: 11}}>
                    {formatVector(stats?.centerOfMass)}
                </div>
            </div>

            {/* Info */}
            <div
                style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid #333',
                    color: '#555',
                    fontSize: 10,
                }}
            >
                💡 Energy & momentum magnitude should remain constant
            </div>
        </div>
    );
};