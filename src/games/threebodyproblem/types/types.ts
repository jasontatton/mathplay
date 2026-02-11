export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Body {
  id: string;
  name: string;
  position: Vector3D;
  velocity: Vector3D;
  mass: number;
  color: string;
  trailColor: string;
  radius: number;
}

export interface SimulationState {
  bodies: Body[];
  isRunning: boolean;
  speed: number;
  gravitationalConstant: number;
  trailLength: number;
  showTrails: boolean;
  showVectors: boolean;
  showGrid: boolean;
  is3D: boolean;
  bloomIntensity: number;
  showStats: boolean;
  integrationMethod: 'euler' | 'verlet' | 'rk4';
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: 'stable' | 'periodic' | 'chaotic' | 'fun' | 'famous' | 'artistic';
  bodies: Omit<Body, 'id'>[];
  gravitationalConstant: number;
  recommendedSpeed: number;
  author?: string;
  year?: number;
}

export interface SimulationStats {
  totalEnergy: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalMomentum: Vector3D;
  centerOfMass: Vector3D;
  time: number;
}

export interface ExportConfig {
  version: string;
  timestamp: string;
  preset?: string;
  state: {
    bodies: Omit<Body, 'id'>[];
    gravitationalConstant: number;
    speed: number;
  };
}
