"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

type PointCloudHandle = {
  geometry: {
    attributes: {
      position: {
        needsUpdate: boolean;
      };
    };
  };
  rotation: {
    y: number;
  };
};

function DotGrid(props: React.ComponentProps<typeof Points>) {
  const ref = useRef<PointCloudHandle | null>(null);
  
  const positions = useMemo(() => {
    const pointPositions: number[] = [];
    const rows = 40;
    const cols = 40;
    const sep = 0.5;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (i - rows / 2) * sep;
        const y = 0;
        const z = (j - cols / 2) * sep;
        pointPositions.push(x, y, z);
      }
    }

    return new Float32Array(pointPositions);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#333"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
    </group>
  );
}

export default function ThreeDotBackground({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 5, 10], fov: 25 }}>
        <fog attach="fog" args={["#050505", 5, 20]} />
        <DotGrid />
      </Canvas>
    </div>
  );
}
