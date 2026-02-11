// src/games/threebodyproblem/store/simulationStore.ts

import {create} from 'zustand';
import {Body, ExportConfig, SimulationState, SimulationStats, Vector3D} from '../types/types';
import {presets} from '../presets/presets';
import {calculateStats, zeroVector} from '../utils/physics';
import {v4 as uuidv4} from 'uuid';

interface SimulationStore extends SimulationState {
    trails: Record<string, Vector3D[]>;
    stats: SimulationStats;
    simulationTime: number;
    initialBodies: Body[];
    currentPresetId: string | null;

    // Actions
    setBodies: (_bodies: Body[]) => void;
    updateBody: (_id: string, _updates: Partial<Body>) => void;
    setIsRunning: (_isRunning: boolean) => void;
    toggleRunning: () => void;
    setSpeed: (_speed: number) => void;
    setGravitationalConstant: (_G: number) => void;
    setTrailLength: (_length: number) => void;
    setShowTrails: (_show: boolean) => void;
    setShowVectors: (_show: boolean) => void;
    setShowGrid: (_show: boolean) => void;
    setIs3D: (_is3D: boolean) => void;
    setBloomIntensity: (_intensity: number) => void;
    setShowStats: (_show: boolean) => void;
    setIntegrationMethod: (_method: 'euler' | 'verlet' | 'rk4') => void;
    loadPreset: (_presetId: string) => void;
    addTrailPoint: (_bodyId: string, _position: Vector3D) => void;
    clearTrails: () => void;
    reset: () => void;
    updateStats: () => void;
    incrementTime: (_dt: number) => void;
    exportConfig: () => ExportConfig;
    importConfig: (_config: ExportConfig) => void;
}

const defaultPreset = presets[0];

const createBodiesFromPreset = (preset: typeof defaultPreset): Body[] => {
    return preset.bodies.map((body) => ({
        ...body,
        id: uuidv4(),
    }));
};

const initialBodies = createBodiesFromPreset(defaultPreset);

export const useSimulationStore = create<SimulationStore>()((set, get) => ({
    bodies: initialBodies,
    initialBodies: initialBodies,
    isRunning: false,
    speed: defaultPreset.recommendedSpeed,
    gravitationalConstant: defaultPreset.gravitationalConstant,
    trailLength: 500,
    showTrails: true,
    showVectors: false,
    showGrid: true,
    is3D: false,
    bloomIntensity: 1.5,
    showStats: true,
    integrationMethod: 'rk4',
    trails: {},
    simulationTime: 0,
    currentPresetId: defaultPreset.id,
    stats: {
        totalEnergy: 0,
        kineticEnergy: 0,
        potentialEnergy: 0,
        totalMomentum: zeroVector(),
        centerOfMass: zeroVector(),
        time: 0,
    },

    setBodies: (bodies) => set({bodies}),

    updateBody: (id, updates) =>
        set((state) => ({
            bodies: state.bodies.map((body) =>
                body.id === id ? {...body, ...updates} : body
            ),
        })),

    setIsRunning: (isRunning) => set({isRunning}),

    toggleRunning: () => set((state) => ({isRunning: !state.isRunning})),

    setSpeed: (speed) => set({speed}),

    setGravitationalConstant: (gravitationalConstant) =>
        set({gravitationalConstant}),

    setTrailLength: (trailLength) => set({trailLength}),

    setShowTrails: (showTrails) => set({showTrails}),

    setShowVectors: (showVectors) => set({showVectors}),

    setShowGrid: (showGrid) => set({showGrid}),

    setIs3D: (is3D) => set({is3D}),

    setBloomIntensity: (bloomIntensity) => set({bloomIntensity}),

    setShowStats: (showStats) => set({showStats}),

    setIntegrationMethod: (integrationMethod) => set({integrationMethod}),

    loadPreset: (presetId) => {
        const preset = presets.find((p) => p.id === presetId);
        if (preset) {
            const newBodies = createBodiesFromPreset(preset);
            set({
                bodies: newBodies,
                initialBodies: newBodies,
                gravitationalConstant: preset.gravitationalConstant,
                speed: preset.recommendedSpeed,
                isRunning: false,
                trails: {},
                simulationTime: 0,
                currentPresetId: presetId,
            });
        }
    },

    addTrailPoint: (bodyId, position) =>
        set((state) => {
            const trail = state.trails[bodyId] || [];
            const newTrail = [...trail, {...position}].slice(-state.trailLength);
            return {
                trails: {
                    ...state.trails,
                    [bodyId]: newTrail,
                },
            };
        }),

    clearTrails: () => set({trails: {}}),

    reset: () => {
        const state = get();
        const resetBodies = state.initialBodies.map((body) => ({
            ...body,
            id: uuidv4(),
        }));
        set({
            bodies: resetBodies,
            initialBodies: resetBodies,
            isRunning: false,
            trails: {},
            simulationTime: 0,
        });
    },

    updateStats: () => {
        const state = get();
        const stats = calculateStats(
            state.bodies,
            state.gravitationalConstant,
            state.simulationTime
        );
        set({stats});
    },

    incrementTime: (dt) =>
        set((state) => ({simulationTime: state.simulationTime + dt})),

    exportConfig: () => {
        const state = get();
        return {
            version: '1.0',
            timestamp: new Date().toISOString(),
            preset: state.currentPresetId ?? undefined,
            state: {
                bodies: state.bodies.map(({id: _, ...rest}) => rest),
                gravitationalConstant: state.gravitationalConstant,
                speed: state.speed,
            },
        };
    },

    importConfig: (config) => {
        const newBodies = config.state.bodies.map((body) => ({
            ...body,
            id: uuidv4(),
        }));
        set({
            bodies: newBodies,
            initialBodies: newBodies,
            gravitationalConstant: config.state.gravitationalConstant,
            speed: config.state.speed,
            isRunning: false,
            trails: {},
            simulationTime: 0,
            currentPresetId: config.preset ?? null,
        });
    },
}));