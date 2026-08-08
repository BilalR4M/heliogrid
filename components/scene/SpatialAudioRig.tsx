"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createClickBuffer,
  createHumBuffer,
  createWindBuffer,
} from "@/lib/audio";
import { useSceneStore } from "@/lib/scene-state";

/**
 * Positional facility audio — wind (altitude), transformer hum (tower/vault),
 * tracking-motor clicks near Array Ring Alpha when the time scrub steps.
 */
export default function SpatialAudioRig() {
  const { camera } = useThree();
  const audioMuted = useSceneStore((s) => s.audioMuted);
  const currentZone = useSceneStore((s) => s.currentZone);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);

  const windAnchor = useRef<THREE.Group>(null);
  const humAnchor = useRef<THREE.Group>(null);
  const clickAnchor = useRef<THREE.Group>(null);

  const listenerRef = useRef<THREE.AudioListener | null>(null);
  const windRef = useRef<THREE.PositionalAudio | null>(null);
  const humRef = useRef<THREE.PositionalAudio | null>(null);
  const clickRef = useRef<THREE.PositionalAudio | null>(null);
  const lastStepRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const listener = new THREE.AudioListener();
    camera.add(listener);
    listenerRef.current = listener;

    const wind = new THREE.PositionalAudio(listener);
    const hum = new THREE.PositionalAudio(listener);
    const click = new THREE.PositionalAudio(listener);

    const ctx = listener.context;
    wind.setBuffer(createWindBuffer(ctx));
    wind.setLoop(true);
    wind.setRefDistance(28);
    wind.setVolume(0);

    hum.setBuffer(createHumBuffer(ctx));
    hum.setLoop(true);
    hum.setRefDistance(14);
    hum.setVolume(0);

    click.setBuffer(createClickBuffer(ctx));
    click.setRefDistance(10);
    click.setVolume(0);

    windAnchor.current?.add(wind);
    humAnchor.current?.add(hum);
    clickAnchor.current?.add(click);

    windRef.current = wind;
    humRef.current = hum;
    clickRef.current = click;

    return () => {
      wind.stop();
      hum.stop();
      click.stop();
      wind.disconnect();
      hum.disconnect();
      click.disconnect();
      camera.remove(listener);
      windRef.current = null;
      humRef.current = null;
      clickRef.current = null;
    };
  }, [camera]);

  useEffect(() => {
    const unlock = async () => {
      const listener = listenerRef.current;
      if (!listener || startedRef.current) return;
      if (listener.context.state === "suspended") {
        await listener.context.resume();
      }
      windRef.current?.play();
      humRef.current?.play();
      startedRef.current = true;
      const master = useSceneStore.getState().audioMuted ? 0 : 1;
      windRef.current?.setVolume(0.22 * master);
      humRef.current?.setVolume(0.18 * master);
      clickRef.current?.setVolume(0.35 * master);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    const master = audioMuted ? 0 : 1;
    windRef.current?.setVolume(0.22 * master);
    humRef.current?.setVolume(0.18 * master);
    clickRef.current?.setVolume(0.35 * master);
  }, [audioMuted]);

  useEffect(() => {
    if (!humAnchor.current) return;
    if (currentZone === "subterranean-vault") {
      humAnchor.current.position.set(0, -16, 0);
    } else {
      humAnchor.current.position.set(0, 2, 0);
    }
  }, [currentZone]);

  useEffect(() => {
    if (currentZone !== "array-ring-alpha" || audioMuted) return;
    const step = Math.round(timeOfDay * 2);
    if (lastStepRef.current === null) {
      lastStepRef.current = step;
      return;
    }
    if (step !== lastStepRef.current) {
      lastStepRef.current = step;
      const click = clickRef.current;
      if (click && startedRef.current) {
        if (click.isPlaying) click.stop();
        click.play();
      }
    }
  }, [audioMuted, currentZone, timeOfDay]);

  return (
    <>
      <group ref={windAnchor} position={[0, 36, 0]} />
      <group ref={humAnchor} position={[0, 2, 0]} />
      <group ref={clickAnchor} position={[50, 1.5, 48]} />
    </>
  );
}
