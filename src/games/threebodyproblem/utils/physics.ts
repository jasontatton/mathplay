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

    const forceMagnitude = (G * body1.mass * body2.mass) / (softenedDistance * softenedDistance);
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

// Euler integration (simple but less accurate)
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

// Velocity Verlet integration (more stable)
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

// Runge-Kutta 4th order (most accurate)
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

// Calculate simulation statistics
export const calculateStats = (
    bodies: Body[],
    G: number,
    time: number
): SimulationStats => {
    if (!bodies || bodies.length === 0) {
        return {
            totalEnergy: 0,
            kineticEnergy: 0,
            potentialEnergy: 0,
            totalMomentum: zeroVector(),
            centerOfMass: zeroVector(),
            time,
        };
    }

    // Kinetic energy: 0.5 * m * v^2
    const kineticEnergy = bodies.reduce((sum, body) => {
        const vSquared = magnitudeSquared(body.velocity);
        return sum + 0.5 * body.mass * vSquared;
    }, 0);

    // Potential energy: -G * m1 * m2 / r (sum over all pairs)
    let potentialEnergy = 0;
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const r = magnitude(subtractVectors(bodies[i].position, bodies[j].position));
            // Add softening to match force calculation
            const softening = 0.05;
            const softenedR = Math.sqrt(r * r + softening * softening);
            potentialEnergy -= (G * bodies[i].mass * bodies[j].mass) / softenedR;
        }
    }

    const totalEnergy = kineticEnergy + potentialEnergy;

    // Total momentum: sum of m * v
    const totalMomentum = bodies.reduce(
        (sum, body) => addVectors(sum, scaleVector(body.velocity, body.mass)),
        zeroVector()
    );

    // Center of mass: sum(m * r) / sum(m)
    const totalMass = bodies.reduce((sum, body) => sum + body.mass, 0);
    const weightedPositions = bodies.reduce(
        (sum, body) => addVectors(sum, scaleVector(body.position, body.mass)),
        zeroVector()
    );
    const centerOfMass = totalMass > 0 ? scaleVector(weightedPositions, 1 / totalMass) : zeroVector();

    return {
        totalEnergy,
        kineticEnergy,
        potentialEnergy,
        totalMomentum,
        centerOfMass,
        time,
    };
};