"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import PlaceholderCaldera, {
  HOLOGRAM_CAMERA,
  SCENE_COLORS,
} from "@/components/scene/PlaceholderCaldera";

const TRANSITION_SECONDS = 2.8;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type TransitionRigProps = {
  entering: boolean;
  reduceMotion: boolean;
  onComplete: () => void;
};

function TransitionRig({ entering, reduceMotion, onComplete }: TransitionRigProps) {
  const { camera } = useThree();
  const progress = useRef(0);
  const done = useRef(false);
  const [blend, setBlend] = useState(0);

  useEffect(() => {
    if (!entering) {
      progress.current = 0;
      done.current = false;
      setBlend(0);
      camera.position.set(...HOLOGRAM_CAMERA.idle);
      return;
    }
    if (reduceMotion) {
      camera.position.set(...HOLOGRAM_CAMERA.entered);
      setBlend(1);
      if (!done.current) {
        done.current = true;
        onComplete();
      }
    }
  }, [entering, reduceMotion, camera, onComplete]);

  useFrame((_, delta) => {
    if (!entering || reduceMotion || done.current) return;

    progress.current = Math.min(1, progress.current + delta / TRANSITION_SECONDS);
    const t = easeInOutCubic(progress.current);
    setBlend(t);

    const idle = new THREE.Vector3(...HOLOGRAM_CAMERA.idle);
    const entered = new THREE.Vector3(...HOLOGRAM_CAMERA.entered);
    camera.position.lerpVectors(idle, entered, t);
    camera.lookAt(0, 0.6, 0);

    if (progress.current >= 1 && !done.current) {
      done.current = true;
      onComplete();
    }
  });

  const spin = !entering && !reduceMotion;

  return (
    <>
      <color attach="background" args={[entering ? SCENE_COLORS.sky : "#07090c"]} />
      <ambientLight intensity={0.2 + blend * 0.15} />
      <directionalLight
        position={[8, 12, 4]}
        intensity={0.15 + blend * 1.65}
        color="#fff1d6"
      />
      <PlaceholderCaldera blend={blend} spin={spin} />
    </>
  );
}

type CalderaHologramProps = {
  entering?: boolean;
  onTransitionComplete?: () => void;
  className?: string;
};

export default function CalderaHologram({
  entering = false,
  onTransitionComplete,
  className = "",
}: CalderaHologramProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const completeRef = useRef(onTransitionComplete);
  completeRef.current = onTransitionComplete;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const handleComplete = () => {
    completeRef.current?.();
  };

  return (
    <div className={`relative h-full min-h-[280px] w-full ${className}`}>
      {!entering && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(78,201,232,0.12)_0%,transparent_65%)]"
        />
      )}
      <Canvas
        camera={{
          position: [...HOLOGRAM_CAMERA.idle],
          fov: HOLOGRAM_CAMERA.fov,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.6, 0);
        }}
      >
        <TransitionRig
          entering={entering}
          reduceMotion={reduceMotion}
          onComplete={handleComplete}
        />
      </Canvas>
    </div>
  );
}
