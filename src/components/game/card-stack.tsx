"use client";

import { useRef, useCallback } from "react";
import { motion, useSpring } from "motion/react";

const PANEL_COUNT = 22;
const WAVE_SPRING = { stiffness: 160, damping: 22, mass: 0.6 };
const SCENE_SPRING = { stiffness: 80, damping: 22, mass: 1 };
const Z_SPREAD = 42;
const SIGMA = 2.8; // how wide the "full" zone is

function Panel({
  index,
  total,
  waveY,
  scaleY,
}: {
  index: number;
  total: number;
  waveY: ReturnType<typeof useSpring>;
  scaleY: ReturnType<typeof useSpring>;
}) {
  const t = index / (total - 1); // 0 = back, 1 = front
  const baseZ = (index - (total - 1)) * Z_SPREAD;

  const w = 200 + t * 80;
  const h = 280 + t * 120;

  const borderL = (0.12 + t * 0.38).toFixed(3);
  const bgL = (0.04 + t * 0.06).toFixed(3);
  const opacity = 0.25 + t * 0.75;

  return (
    <motion.div
      className="absolute rounded-xl pointer-events-none"
      style={{
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        translateZ: baseZ,
        y: waveY,
        scaleY,
        transformOrigin: "bottom center",
        opacity,
        border: `1px solid oklch(${borderL} 0 0)`,
        backgroundColor: `oklch(${bgL} 0 0)`,
      }}
    />
  );
}

export default function StackedPanels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  const waveYSprings = Array.from({ length: PANEL_COUNT }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSpring(0, WAVE_SPRING)
  );

  const scaleYSprings = Array.from({ length: PANEL_COUNT }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSpring(1, WAVE_SPRING)
  );

  const rotY = useSpring(-42, SCENE_SPRING);
  const rotX = useSpring(18, SCENE_SPRING);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      isHovering.current = true;

      const cx = (e.clientX - rect.left) / rect.width;
      const cy = (e.clientY - rect.top) / rect.height;

      rotY.set(-42 + (cx - 0.5) * 14);
      rotX.set(18 + (cy - 0.5) * -10);

      // Front cards (high index) appear on the right with rotateY(-42),
      // so cursor X maps directly: right side of screen = high index
      const cursorCardPos = cx * (PANEL_COUNT - 1);

      waveYSprings.forEach((spring, i) => {
        const dist = Math.abs(i - cursorCardPos);
        const influence = Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
        // Card under cursor rises; distant cards stay flat
        spring.set(-influence * 70);
      });

      scaleYSprings.forEach((spring, i) => {
        const dist = Math.abs(i - cursorCardPos);
        const influence = Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
        // Full size at cursor, shrink away from it
        spring.set(0.35 + influence * 0.65);
      });
    },
    [rotY, rotX, waveYSprings, scaleYSprings]
  );

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    rotY.set(-42);
    rotX.set(18);
    waveYSprings.forEach((s) => s.set(0));
    scaleYSprings.forEach((s) => s.set(1));
  }, [rotY, rotX, waveYSprings, scaleYSprings]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center select-none"
      style={{ perspective: "900px" }}
    >
      <motion.div
        style={{
          rotateY: rotY,
          rotateX: rotX,
          transformStyle: "preserve-3d",
          position: "relative",
          width: 0,
          height: 0,
        }}
      >
        {Array.from({ length: PANEL_COUNT }).map((_, i) => (
          <Panel
            key={i}
            index={i}
            total={PANEL_COUNT}
            waveY={waveYSprings[i]}
            scaleY={scaleYSprings[i]}
          />
        ))}
      </motion.div>
    </div>
  );
}
