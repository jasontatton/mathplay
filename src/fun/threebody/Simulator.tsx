// src/App.tsx
// src/ThreeBodyCanvas.tsx
import React, {useEffect, useRef, useState} from "react";
import {Button, Slider} from "antd";

// src/types.ts
export interface Body {
    x: number;   // position X
    y: number;   // position Y
    vx: number;  // velocity X
    vy: number;  // velocity Y
    mass: number;
    color: string;
}

export function updateBodies(bodies: Body[], dt: number): Body[] {
    // In simulation units — tweak for stability
    const G = 1;

    // Deep copy
    const newBodies: Body[] = bodies.map(b => ({...b}));

    for (let i = 0; i < bodies.length; i++) {
        let ax = 0;
        let ay = 0;

        for (let j = 0; j < bodies.length; j++) {
            if (i === j) continue;

            const dx = bodies[j].x - bodies[i].x;
            const dy = bodies[j].y - bodies[i].y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist > 1e-6) {
                const force = (G * bodies[j].mass) / distSq;
                ax += force * (dx / dist);
                ay += force * (dy / dist);
            }
        }

        newBodies[i].vx += ax * dt;
        newBodies[i].vy += ay * dt;
    }

    // Update positions
    for (let i = 0; i < bodies.length; i++) {
        newBodies[i].x += newBodies[i].vx * dt;
        newBodies[i].y += newBodies[i].vy * dt;
    }

    return newBodies;
}

interface ThreeBodyCanvasProps {
    bodies: Body[];
    setBodies: React.Dispatch<React.SetStateAction<Body[]>>;
}

const ThreeBodyCanvas: React.FC<ThreeBodyCanvasProps> = ({bodies, setBodies}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw each body
            bodies.forEach((b) => {
                ctx.beginPath();
                ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.fill();
            });

            // Physics update
            const newBodies = updateBodies(bodies, 0.5); // dt 0.5 simulation units
            setBodies(newBodies);

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [bodies, setBodies]);

    return <canvas ref={canvasRef} width={800} height={600}/>;
};

export const ThreeBodySimulator: React.FC = () => {
    const [bodies, setBodies] = useState<Body[]>([
        {x: 200, y: 300, vx: 0, vy: 1, mass: 5, color: "red"},
        {x: 400, y: 300, vx: 0, vy: -1, mass: 5, color: "blue"},
        {x: 300, y: 100, vx: 1, vy: 0, mass: 5, color: "green"}
    ]);

    const updateMass = (index: number, mass: number) => {
        setBodies(prev => {
            const newBodies = [...prev];
            newBodies[index] = {...newBodies[index], mass};
            return newBodies;
        });
    };

    const reset = () => {
        setBodies([
            {x: 200, y: 300, vx: 0, vy: 1, mass: 5, color: "red"},
            {x: 400, y: 300, vx: 0, vy: -1, mass: 5, color: "blue"},
            {x: 300, y: 100, vx: 1, vy: 0, mass: 5, color: "green"}
        ]);
    };

    return (
        <div style={{padding: 20}}>
            <h1>Three Body Problem – React + TypeScript + Ant Design</h1>
            <ThreeBodyCanvas bodies={bodies} setBodies={setBodies}/>
            <div style={{marginTop: 20}}>
                {bodies.map((b, i) => (
                    <div key={i} style={{marginBottom: 10}}>
            <span style={{marginRight: 10, color: b.color}}>
              Body {i + 1} Mass:
            </span>
                        <Slider
                            min={1}
                            max={20}
                            step={0.5}
                            value={b.mass}
                            onChange={(val) => updateMass(i, val)}
                        />
                    </div>
                ))}
                <Button type="primary" onClick={reset}>
                    Reset
                </Button>
            </div>
        </div>
    );
};