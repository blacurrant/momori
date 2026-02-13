"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
// @ts-expect-error - maath/random/dist/maath-random.esm does not have a declaration file
import * as random from 'maath/random/dist/maath-random.esm';

function Stars(props: any) {
    const ref = useRef<any>(null);
    // Generate 5000 random points in a sphere
    const sphere = useMemo(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#ffa0e0"
                    size={0.002}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.8}
                />
            </Points>
        </group>
    );
}

export function DreamBackground() {
    return (
        <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#0a0510] via-[#100b1a] to-[#050208]">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars />
            </Canvas>
        </div>
    );
}
