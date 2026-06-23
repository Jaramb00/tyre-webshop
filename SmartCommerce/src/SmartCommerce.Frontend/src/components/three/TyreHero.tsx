import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows, AdaptiveDpr } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Box } from '@mui/material';
import TyreModel from './TyreModel';

/**
 * Hero canvas for the 3D tyre.
 *
 * Performance & compatibility guards (per the threejs skills' performance notes):
 *  - prefers-reduced-motion  → static tyre, no spin
 *  - mobile / low-core       → lower DPR, shadows off, fewer tread blocks
 *  - no WebGL                → graceful CSS fallback, never a blank box
 *
 * Lighting uses Lightformers (studio softboxes) to build an env map in-engine,
 * so the alloy reads as real metal with NO network HDR download.
 */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function TyreHero() {
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(true);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [forceStatic, setForceStatic] = useState(false);

  useEffect(() => {
    setWebgl(detectWebGL());
    const cores = navigator.hardwareConcurrency || 4;
    const narrow = window.innerWidth < 768;
    // Save-Data or very weak devices → skip WebGL entirely (best mobile perf)
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setForceStatic(Boolean(conn?.saveData) || cores <= 2);
    setIsLowEnd(narrow || cores <= 4);
  }, []);

  // WebGL unavailable OR very low-end → premium static fallback (no 3D runtime)
  if (!webgl || forceStatic) {
    return <StaticFallback />;
  }

  const quality = isLowEnd ? 'low' : 'high';
  const enableShadows = !isLowEnd;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        overflow: 'hidden',
        height: { xs: 320, sm: 420, md: 560 },
        cursor: 'grab',
        touchAction: 'pan-y', // let the page scroll vertically over the canvas on touch
      }}
    >
      <Canvas
        shadows={enableShadows}
        dpr={isLowEnd ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.4, 7], fov: 38 }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <AdaptiveDpr pixelated />

        {/* Key + fill + ambient (three-point feel, from threejs-lighting) */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={2.4}
          castShadow={enableShadows}
          shadow-mapSize-width={enableShadows ? 1024 : 256}
          shadow-mapSize-height={enableShadows ? 1024 : 256}
          shadow-bias={-0.0002}
        />
        <directionalLight position={[-5, 2, 3]} intensity={0.7} color="#cdd6e0" />

        <Suspense fallback={null}>
          <TyreModel animate={!reduced} quality={quality} />

          {/* In-engine studio environment for metal reflections (no HDR fetch) */}
          <Environment resolution={256}>
            <Lightformer intensity={3} position={[0, 4, 2]} scale={[8, 3, 1]} form="rect" />
            <Lightformer intensity={1.6} position={[-4, 1, 2]} scale={[3, 4, 1]} form="rect" color="#aebbcc" />
            <Lightformer intensity={1.2} position={[4, -1, 2]} scale={[3, 4, 1]} form="rect" />
            <Lightformer intensity={1.4} position={[2, 2, -3]} scale={[4, 4, 1]} form="rect" color="#d9b877" />
          </Environment>

          {enableShadows && (
            <ContactShadows
              position={[0, -2.2, 0]}
              opacity={0.5}
              scale={12}
              blur={2.6}
              far={4}
              resolution={512}
              color="#000000"
            />
          )}

          {/* Subtle showroom polish — gold glints bloom, edges fall to vignette.
              Desktop-only (threejs-postprocessing perf note: each pass = full-screen render). */}
          {!isLowEnd && (
            <EffectComposer>
              <Bloom
                intensity={0.5}
                luminanceThreshold={0.6}
                luminanceSmoothing={0.3}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.25} darkness={0.7} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>

      {/* Subtle radial glow behind the wheel (depth, not a cheap neon) */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background:
            'radial-gradient(circle at 55% 45%, rgba(166,124,60,0.16) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

function StaticFallback() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 340, sm: 420, md: 560 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: { xs: 240, md: 360 },
          height: { xs: 240, md: 360 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, #2b2d31 0%, #0b0b0c 62%)',
          border: '14px solid #0b0b0c',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.6)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '38%',
            borderRadius: '50%',
            border: '3px solid #A67C3C',
            background: 'radial-gradient(circle, #3a3d42, #16171a)',
          },
        }}
      />
    </Box>
  );
}
