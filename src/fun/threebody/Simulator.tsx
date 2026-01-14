import React, {useCallback, useEffect, useRef, useState} from "react";

interface BodyState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    mass: number;
}

interface Preset {
    name: string;
    description: string;
    bodies: BodyState[];
}

// Some presets — add more as needed
const PRESETS: Preset[] = [
    {
        name: "Figure-8",
        description: "Equal masses follow a figure-eight trajectory",
        bodies: [
            {x: 0.97000436, y: -0.24308753, vx: 0.466203685, vy: 0.43236573, mass: 1},
            {x: -0.97000436, y: 0.24308753, vx: 0.466203685, vy: 0.43236573, mass: 1},
            {x: 0, y: 0, vx: -0.93240737, vy: -0.86473146, mass: 1},
        ],
    },
    {
        name: "Lagrange Equilateral",
        description: "Three equal masses at vertices of an equilateral triangle",
        bodies: [
            {x: 1, y: 0, vx: 0, vy: 0.5, mass: 1},
            {x: -0.5, y: Math.sqrt(3) / 2, vx: -0.4330127, vy: -0.25, mass: 1},
            {x: -0.5, y: -Math.sqrt(3) / 2, vx: 0.4330127, vy: -0.25, mass: 1},
        ],
    },
];

type IntegratorType = "verlet" | "euler" | "rk4";

const G_DEFAULT = 1;

function integrateEULER(bodies: BodyState[], G: number, dt: number): BodyState[] {
    const n = bodies.length;
    const ax = new Array(n).fill(0);
    const ay = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const dx = bodies[j].x - bodies[i].x;
            const dy = bodies[j].y - bodies[i].y;
            const r2 = dx * dx + dy * dy;
            const invR3 = 1 / Math.pow(r2, 1.5);
            const f = G * bodies[i].mass * bodies[j].mass * invR3;
            const fx = f * dx;
            const fy = f * dy;
            ax[i] += fx / bodies[i].mass;
            ay[i] += fy / bodies[i].mass;
            ax[j] -= fx / bodies[j].mass;
            ay[j] -= fy / bodies[j].mass;
        }
    }

    return bodies.map((b, i) => ({
        ...b,
        vx: b.vx + ax[i] * dt,
        vy: b.vy + ay[i] * dt,
        x: b.x + b.vx * dt,
        y: b.y + b.vy * dt,
    }));
}

function integrateVERLET(bodies: BodyState[], G: number, dt: number): BodyState[] {
    const n = bodies.length;
    const ax = new Array(n).fill(0);
    const ay = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const dx = bodies[j].x - bodies[i].x;
            const dy = bodies[j].y - bodies[i].y;
            const r2 = dx * dx + dy * dy;
            const invR3 = 1 / Math.pow(r2, 1.5);
            const f = G * bodies[i].mass * bodies[j].mass * invR3;
            const fx = f * dx;
            const fy = f * dy;
            ax[i] += fx / bodies[i].mass;
            ay[i] += fy / bodies[i].mass;
            ax[j] -= fx / bodies[j].mass;
            ay[j] -= fy / bodies[j].mass;
        }
    }

    return bodies.map((b, i) => {
        const xNew = b.x + b.vx * dt + 0.5 * ax[i] * dt * dt;
        const yNew = b.y + b.vy * dt + 0.5 * ay[i] * dt * dt;
        const vxNew = b.vx + ax[i] * dt;
        const vyNew = b.vy + ay[i] * dt;
        return {...b, x: xNew, y: yNew, vx: vxNew, vy: vyNew};
    });
}

// A simple RK4 method
function integrateRK4(bodies: BodyState[], G: number, dt: number): BodyState[] {
    function accel(state: BodyState[]): { ax: number[]; ay: number[] } {
        const n = state.length;
        const ax = new Array(n).fill(0);
        const ay = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const dx = state[j].x - state[i].x;
                const dy = state[j].y - state[i].y;
                const r2 = dx * dx + dy * dy;
                const invR3 = 1 / Math.pow(r2, 1.5);
                const f = G * state[i].mass * state[j].mass * invR3;
                const fx = f * dx;
                const fy = f * dy;
                ax[i] += fx / state[i].mass;
                ay[i] += fy / state[i].mass;
                ax[j] -= fx / state[j].mass;
                ay[j] -= fy / state[j].mass;
            }
        }
        return {ax, ay};
    }

    const k1 = accel(bodies);
    const k1Vel = bodies.map((b, _i) => ({vx: b.vx, vy: b.vy}));

    const mid1 = bodies.map((b, i) => ({
        ...b,
        x: b.x + k1Vel[i].vx * dt / 2,
        y: b.y + k1Vel[i].vy * dt / 2,
        vx: b.vx + k1.ax[i] * dt / 2,
        vy: b.vy + k1.ay[i] * dt / 2
    }));

    const k2 = accel(mid1);
    const k2Vel = mid1.map((b, _i) => ({vx: b.vx, vy: b.vy}));

    const mid2 = bodies.map((b, i) => ({
        ...b,
        x: b.x + k2Vel[i].vx * dt / 2,
        y: b.y + k2Vel[i].vy * dt / 2,
        vx: b.vx + k2.ax[i] * dt / 2,
        vy: b.vy + k2.ay[i] * dt / 2
    }));

    const k3 = accel(mid2);
    const k3Vel = mid2.map((b, _i) => ({vx: b.vx, vy: b.vy}));

    const endState = bodies.map((b, i) => ({
        ...b,
        x: b.x + k3Vel[i].vx * dt,
        y: b.y + k3Vel[i].vy * dt,
        vx: b.vx + k3.ax[i] * dt,
        vy: b.vy + k3.ay[i] * dt
    }));

    const k4 = accel(endState);

    return bodies.map((b, i) => ({
        ...b,
        x: b.x + dt * (k1Vel[i].vx + 2 * k2Vel[i].vx + 2 * k3Vel[i].vx + endState[i].vx) / 6,
        y: b.y + dt * (k1Vel[i].vy + 2 * k2Vel[i].vy + 2 * k3Vel[i].vy + endState[i].vy) / 6,
        vx: b.vx + dt * (k1.ax[i] + 2 * k2.ax[i] + 2 * k3.ax[i] + k4.ax[i]) / 6,
        vy: b.vy + dt * (k1.ay[i] + 2 * k2.ay[i] + 2 * k3.ay[i] + k4.ay[i]) / 6
    }));
}

export default function ThreeBodySim() {
    const [bodies, setBodies] = useState<BodyState[]>(PRESETS[0].bodies);
    const [G, setG] = useState(G_DEFAULT);
    const [dt, setDt] = useState(0.002);
    const [integrator, setIntegrator] = useState<IntegratorType>("verlet");
    const [running, setRunning] = useState(true);
    const [zoom, setZoom] = useState(100);
    const [trailHistory, setTrailHistory] = useState<BodyState[][]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const step = useCallback(() => {
        let newBodies: BodyState[] = bodies;
        switch (integrator) {
            case "euler":
                newBodies = integrateEULER(bodies, G, dt);
                break;
            case "verlet":
                newBodies = integrateVERLET(bodies, G, dt);
                break;
            case "rk4":
                newBodies = integrateRK4(bodies, G, dt);
                break;
        }
        setBodies(newBodies);
        setTrailHistory(prev => [...prev.slice(-500), newBodies]);
    }, [bodies, G, dt, integrator]);

    useEffect(() => {
        let last = performance.now();

        function loop(now: number) {
            const elapsed = (now - last) / 1000;
            last = now;
            if (running) {
                // fixed-step updates
                const steps = Math.floor(elapsed / dt);
                for (let i = 0; i < steps; i++) step();
            }
            draw();
            requestAnimationFrame(loop);
        }

        function draw() {
            const ctx = canvasRef.current!.getContext("2d")!;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.save();
            ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.scale(zoom, zoom);

            // Trails
            trailHistory.forEach((pos, idx) => {
                ctx.strokeStyle = `rgba(255,255,255,${idx / trailHistory.length})`;
                ctx.beginPath();
                pos.forEach((b, _i) => {
                    ctx.moveTo(b.x, b.y);
                    ctx.arc(b.x, b.y, 0.002, 0, Math.PI * 2);
                });
                ctx.stroke();
            });

            bodies.forEach(b => {
                ctx.beginPath();
                ctx.arc(b.x, b.y, 0.02 * b.mass, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
            });
            ctx.restore();
        }

        requestAnimationFrame(loop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running, zoom, trailHistory, step]);

    return (
        <div style={{display: "flex"}}>
            <canvas
                ref={canvasRef}
                width={800}
                height={800}
                style={{background: "black"}}
            />
            <div style={{marginLeft: "1em", color: "white"}}>
                <h3>Three Body Simulator</h3>
                <div>
                    <button onClick={() => setRunning(false)}>Pause</button>
                    <button onClick={() => setRunning(true)}>Resume</button>
                    <button onClick={() => setBodies(PRESETS[0].bodies)}>Reset</button>
                </div>
                <div>
                    <label>
                        G:
                        <input
                            type="number"
                            value={G}
                            step={0.1}
                            onChange={e => setG(parseFloat(e.target.value))}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        dt:
                        <input
                            type="number"
                            value={dt}
                            step={0.001}
                            onChange={e => setDt(parseFloat(e.target.value))}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Zoom:
                        <input
                            type="number"
                            value={zoom}
                            onChange={e => setZoom(parseFloat(e.target.value))}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Integrator:
                        <select value={integrator} onChange={e => setIntegrator(e.target.value as IntegratorType)}>
                            <option value="verlet">Velocity Verlet</option>
                            <option value="euler">Euler</option>
                            <option value="rk4">RK4</option>
                        </select>
                    </label>
                </div>
                <div>
                    <h4>Presets</h4>
                    {PRESETS.map(p => (
                        <div key={p.name}>
                            <button onClick={() => setBodies(p.bodies)}>{p.name}</button>
                            <p style={{maxWidth: "200px"}}>{p.description}</p>
                        </div>
                    ))}
                </div>
                <div>
                    <h4>Save/Load</h4>
                    <button
                        onClick={() => {
                            const json = JSON.stringify(bodies, null, 2);
                            navigator.clipboard.writeText(json);
                            alert("Copied current state to clipboard");
                        }}
                    >
                        Copy Current State
                    </button>
                    <textarea
                        onChange={e => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                setBodies(parsed);
                            } catch {
                                // ignore parse errors
                            }
                        }}
                        placeholder="Paste JSON to load state"
                        style={{width: "200px", height: "100px"}}
                    />
                </div>
            </div>
        </div>
    );
}