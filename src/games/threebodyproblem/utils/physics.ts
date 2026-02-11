// src/games/threebodyproblem/utils/physics.ts

import {Body, SimulationStats, Vector3D} from '../types/types';

// Vector operations
export const addVectors = (a: Vector3D, b: Vector3D): Vector3D => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
});

export const subtractVectors = (a: Vector3D, b: Vector3D): Vector3D => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
});

export const scaleVector = (v: Vector3D, scalar: number): Vector3D => ({
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar,
});

export const magnitude = (v: Vector3D): number => {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
};

export const magnitudeSquared = (v: Vector3D): number => {
    return v.x * v.x + v.y * v.y + v.z * v.z;
};

export const normalize = (v: Vector3D): Vector3D => {
    const mag = magnitude(v);
    if (mag === 0) return {x: 0, y: 0, z: 0};
    return scaleVector(v, 1 / mag);
};

export const dotProduct = (a: Vector3D, b: Vector3D): number => {
    return a.x * b.x + a.y * b.y + a.z * b.z;
};

export const crossProduct = (a: Vector3D, b: Vector3D): Vector3D => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});

export const zeroVector = (): Vector3D => ({x: 0, y: 0, z: 0});

// Gravitational force between two bodies
export const gravitationalForce = (
    body1: Body,
    body2: Body,
    G: number
): Vector3D => {
    const r = subtractVectors(body2.position, body1.position);
    const distance = magnitude(r);

    // Softening factor to prevent singularities
    const softening = 0.05;
    const softenedDistance = Math.sqrt(distance * distance + softening * softening);

    const forceMagnitude =
        (G * body1.mass * body2.mass) / (softenedDistance * softenedDistance);
    const forceDirection = normalize(r);

    return scaleVector(forceDirection, forceMagnitude);
};

// Calculate acceleration for a body
export const calculateAcceleration = (
    body: Body,
    allBodies: Body[],
    G: number
): Vector3D => {
    let totalForce: Vector3D = zeroVector();

    for (const otherBody of allBodies) {
        if (otherBody.id !== body.id) {
            const force = gravitationalForce(body, otherBody, G);
            totalForce = addVectors(totalForce, force);
        }
    }

    return scaleVector(totalForce, 1 / body.mass);
};

// Euler integration
export const stepSimulationEuler = (
    bodies: Body[],
    dt: number,
    G: number
): Body[] => {
    const accelerations = bodies.map((body) =>
        calculateAcceleration(body, bodies, G)
    );

    return bodies.map((body, i) => ({
        ...body,
        position: addVectors(body.position, scaleVector(body.velocity, dt)),
        velocity: addVectors(body.velocity, scaleVector(accelerations[i], dt)),
    }));
};

// Velocity Verlet integration
export const stepSimulationVerlet = (
    bodies: Body[],
    dt: number,
    G: number
): Body[] => {
    const accelerations = bodies.map((body) =>
        calculateAcceleration(body, bodies, G)
    );

    const newBodies = bodies.map((body, i) => ({
        ...body,
        position: addVectors(
            body.position,
            addVectors(
                scaleVector(body.velocity, dt),
                scaleVector(accelerations[i], 0.5 * dt * dt)
            )
        ),
    }));

    const newAccelerations = newBodies.map((body) =>
        calculateAcceleration(body, newBodies, G)
    );

    return newBodies.map((body, i) => ({
        ...body,
        velocity: addVectors(
            body.velocity,
            scaleVector(addVectors(accelerations[i], newAccelerations[i]), 0.5 * dt)
        ),
    }));
};

// Runge-Kutta 4th order
export const stepSimulationRK4 = (
    bodies: Body[],
    dt: number,
    G: number
): Body[] => {
    const getDerivatives = (
        currentBodies: Body[]
    ): { dPos: Vector3D; dVel: Vector3D }[] => {
        return currentBodies.map((body) => ({
            dPos: body.velocity,
            dVel: calculateAcceleration(body, currentBodies, G),
        }));
    };

    const applyDerivatives = (
        originalBodies: Body[],
        derivatives: { dPos: Vector3D; dVel: Vector3D }[],
        scale: number
    ): Body[] => {
        return originalBodies.map((body, i) => ({
            ...body,
            position: addVectors(body.position, scaleVector(derivatives[i].dPos, scale)),
            velocity: addVectors(body.velocity, scaleVector(derivatives[i].dVel, scale)),
        }));
    };

    const k1 = getDerivatives(bodies);
    const k2 = getDerivatives(applyDerivatives(bodies, k1, dt / 2));
    const k3 = getDerivatives(applyDerivatives(bodies, k2, dt / 2));
    const k4 = getDerivatives(applyDerivatives(bodies, k3, dt));

    return bodies.map((body, i) => ({
        ...body,
        position: addVectors(
            body.position,
            scaleVector(
                addVectors(
                    addVectors(k1[i].dPos, scaleVector(k2[i].dPos, 2)),
                    addVectors(scaleVector(k3[i].dPos, 2), k4[i].dPos)
                ),
                dt / 6
            )
        ),
        velocity: addVectors(
            body.velocity,
            scaleVector(
                addVectors(
                    addVectors(k1[i].dVel, scaleVector(k2[i].dVel, 2)),
                    addVectors(scaleVector(k3[i].dVel, 2), k4[i].dVel)
                ),
                dt / 6
            )
        ),
    }));
};

// Step simulation with chosen method
export const stepSimulation = (
    bodies: Body[],
    dt: number,
    G: number,
    method: 'euler' | 'verlet' | 'rk4' = 'rk4'
): Body[] => {
    switch (method) {
        case 'euler':
            return stepSimulationEuler(bodies, dt, G);
        case 'verlet':
            return stepSimulationVerlet(bodies, dt, G);
        case 'rk4':
        default:
            return stepSimulationRK4(bodies, dt, G);
    }
};

// Calculate simulation statistics - FIXED VERSION
export const calculateStats = (
    bodies: Body[],
    G: number,
    time: number
): SimulationStats => {
    // Default return for empty/invalid input
    if (!bodies || bodies.length === 0) {
        return {
            totalEnergy: 0,
            kineticEnergy: 0,
            potentialEnergy: 0,
            totalMomentum: {x: 0, y: 0, z: 0},
            centerOfMass: {x: 0, y: 0, z: 0},
            time,
        };
    }

    // Kinetic energy: sum of 0.5 * m * |v|^2
    let kineticEnergy = 0;
    for (const body of bodies) {
        const vx = body.velocity.x;
        const vy = body.velocity.y;
        const vz = body.velocity.z;
        const vSquared = vx * vx + vy * vy + vz * vz;
        kineticEnergy += 0.5 * body.mass * vSquared;
    }

    // Potential energy: sum of -G * m1 * m2 / r for all pairs
    let potentialEnergy = 0;
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const dx = bodies[j].position.x - bodies[i].position.x;
            const dy = bodies[j].position.y - bodies[i].position.y;
            const dz = bodies[j].position.z - bodies[i].position.z;
            const distSquared = dx * dx + dy * dy + dz * dz;
            const softening = 0.05;
            const softenedDist = Math.sqrt(distSquared + softening * softening);
            potentialEnergy -= (G * bodies[i].mass * bodies[j].mass) / softenedDist;
        }
    }

    const totalEnergy = kineticEnergy + potentialEnergy;

    // Total momentum: sum of m * v
    let momentumX = 0;
    let momentumY = 0;
    let momentumZ = 0;
    for (const body of bodies) {
        momentumX += body.mass * body.velocity.x;
        momentumY += body.mass * body.velocity.y;
        momentumZ += body.mass * body.velocity.z;
    }
    const totalMomentum: Vector3D = {
        x: momentumX,
        y: momentumY,
        z: momentumZ,
    };

    // Center of mass: sum(m * r) / sum(m)
    let totalMass = 0;
    let comX = 0;
    let comY = 0;
    let comZ = 0;
    for (const body of bodies) {
        totalMass += body.mass;
        comX += body.mass * body.position.x;
        comY += body.mass * body.position.y;
        comZ += body.mass * body.position.z;
    }
    const centerOfMass: Vector3D =
        totalMass > 0
            ? {
                x: comX / totalMass,
                y: comY / totalMass,
                z: comZ / totalMass,
            }
            : {x: 0, y: 0, z: 0};

    return {
        totalEnergy,
        kineticEnergy,
        potentialEnergy,
        totalMomentum,
        centerOfMass,
        time,
    };
};