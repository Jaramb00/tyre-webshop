import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural 3D tyre — rubber tread + alloy rim + gold accent ring.
 *
 * Skills applied:
 *  - threejs-geometry   : procedural primitives (cylinder/torus/box), no model file
 *  - threejs-materials  : PBR MeshStandardMaterial (rough rubber, metal alloy, gold)
 *  - threejs-textures   : procedural CanvasTexture tread bump, RepeatWrapping
 *  - threejs-interaction: grab-and-flick spin with inertia + scroll influence
 *  - threejs-fundamentals: delta-clamped Clock animation, axle-along-Y orient pattern
 */

interface TyreModelProps {
  animate?: boolean;
  quality?: 'high' | 'low';
}

const R_OUT = 2.0;
const WIDTH = 0.86;
const R_RIM = 1.2;

// Sidewall lettering ring — geometry radii + the radius the text sits at.
// The text radius / SW_OUT ratio must match the canvas draw radius so the
// curved text aligns with RingGeometry's planar UV projection.
const SW_IN = 1.42;
const SW_OUT = 1.8;
const SW_TEXT_R = 1.6;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Procedural grayscale tread pattern → bumpMap (no network fetch, threejs-textures). */
function makeTreadBump(): THREE.CanvasTexture {
  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Mid-grey base = neutral height
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);

  // Longitudinal grooves (dark = recessed)
  ctx.fillStyle = '#2a2a2a';
  const grooves = 4;
  for (let i = 1; i < grooves; i++) {
    const y = (h / grooves) * i;
    ctx.fillRect(0, y - 3, w, 6);
  }

  // Chevron tread blocks (light = raised)
  ctx.fillStyle = '#e8e8e8';
  const cols = 16;
  for (let c = 0; c < cols; c++) {
    const x = (w / cols) * c;
    for (let band = 0; band < grooves; band++) {
      const yTop = (h / grooves) * band + 8;
      const blockH = h / grooves - 16;
      const skew = band % 2 === 0 ? 10 : -10;
      ctx.beginPath();
      ctx.moveTo(x + 4, yTop);
      ctx.lineTo(x + w / cols - 4 + skew, yTop);
      ctx.lineTo(x + w / cols - 4, yTop + blockH);
      ctx.lineTo(x + 4 + skew, yTop + blockH);
      ctx.closePath();
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 1); // tile around circumference
  tex.anisotropy = 4;
  return tex;
}

/** Branded "Ž" centre-cap medallion (gold disc, dark lettermark). */
function makeLogoTexture(): THREE.CanvasTexture {
  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const c = s / 2;

  // Gold disc with a subtle radial sheen
  const grad = ctx.createRadialGradient(c, c * 0.7, 10, c, c, c);
  grad.addColorStop(0, '#D4A855');
  grad.addColorStop(0.55, '#A67C3C');
  grad.addColorStop(1, '#7A5628');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(c, c, c - 4, 0, Math.PI * 2);
  ctx.fill();

  // Dark inner ring border
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(c, c, c - 22, 0, Math.PI * 2);
  ctx.stroke();

  // Ž lettermark
  ctx.fillStyle = '#161616';
  ctx.font = 'bold 150px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ž', c, c + 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Curved "VULKANIZER • ŽELJKO •" sidewall lettering → bumpMap (raised rubber). */
function makeSidewallText(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  // Tyre-black base; lighter grey = raised lettering (drives both colour + bump)
  ctx.fillStyle = '#0c0c0d';
  ctx.fillRect(0, 0, size, size);

  const radius = (SW_TEXT_R / SW_OUT) * c; // align with RingGeometry UV projection
  ctx.translate(c, c);
  ctx.fillStyle = '#9a968c';
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Build a repeated string long enough to wrap the full circumference
  const phrase = 'VULKANIZER  •  ŽELJKO  •  ';
  const circ = 2 * Math.PI * radius;
  let s = '';
  while (ctx.measureText(s).width < circ) s += phrase;

  // Distribute characters tangentially around the circle (authentic tyre wrap)
  let angle = -Math.PI / 2;
  for (const ch of s) {
    const w = ctx.measureText(ch).width;
    const a = w / radius;
    ctx.save();
    ctx.rotate(angle + a / 2);
    ctx.translate(0, -radius);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += a;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export default function TyreModel({ animate = true, quality = 'high' }: TyreModelProps) {
  const { gl } = useThree();
  const orient = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const tilt = useRef({ x: 0, y: 0 });

  // Interaction state
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const angularVel = useRef(animate ? 0.5 : 0); // rad/sec
  const idleSpeed = animate ? 0.5 : 0;

  const treadCount = quality === 'high' ? 56 : 28;
  const treadBump = useMemo(() => makeTreadBump(), []);
  const logoTex = useMemo(() => makeLogoTexture(), []);
  const sidewallText = useMemo(() => makeSidewallText(), []);

  const treadBlocks = useMemo(() => {
    const arr: { position: [number, number, number]; rotationY: number }[] = [];
    for (let i = 0; i < treadCount; i++) {
      const theta = (i / treadCount) * Math.PI * 2;
      arr.push({ position: [Math.cos(theta) * R_OUT, 0, Math.sin(theta) * R_OUT], rotationY: -theta });
    }
    return arr;
  }, [treadCount]);

  const spokes = useMemo(
    () => Array.from({ length: 5 }, (_, i) => ({ rotationY: (i / 5) * Math.PI * 2 })),
    [],
  );
  const lugs = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const theta = (i / 5) * Math.PI * 2;
        return { position: [Math.cos(theta) * 0.42, 0, Math.sin(theta) * 0.42] as [number, number, number] };
      }),
    [],
  );

  // Drag-to-spin (window listeners so the drag continues outside the mesh) + scroll nudge
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !spin.current) return;
      const now = performance.now();
      const dt = Math.max((now - lastT.current) / 1000, 0.008);
      const dx = e.clientX - lastX.current;
      const deltaRot = dx * 0.01;
      spin.current.rotation.y += deltaRot;
      angularVel.current = clamp(deltaRot / dt, -14, 14);
      lastX.current = e.clientX;
      lastT.current = now;
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      gl.domElement.style.cursor = 'grab';
    };
    const onScroll = (e: WheelEvent) => {
      // Wheel reacts to page scroll — ties the object to the user's motion
      angularVel.current = clamp(angularVel.current + e.deltaY * 0.0006, -14, 14);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('wheel', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('wheel', onScroll);
    };
  }, [gl]);

  useFrame((state, delta) => {
    if (!orient.current || !spin.current) return;
    const d = Math.min(delta, 0.05);

    if (start.current === null) start.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - start.current;
    const p = animate ? Math.min(elapsed / 1.6, 1) : 1;
    const eased = easeOutCubic(p);

    orient.current.position.x = THREE.MathUtils.lerp(-5.2, 0, eased);

    // Spin model: entrance roll-in → flick inertia decaying to idle
    if (!dragging.current) {
      if (p < 1 && animate) {
        spin.current.rotation.y += d * (idleSpeed + (1 - p) * 7);
      } else {
        angularVel.current += (idleSpeed - angularVel.current) * Math.min(1, d * 0.8);
        spin.current.rotation.y += angularVel.current * d;
      }
    }

    // Damped cursor-follow tilt
    const targetY = state.pointer.x * 0.35;
    const targetX = -state.pointer.y * 0.22;
    const k = Math.min(1, d * 4);
    tilt.current.x += (targetX - tilt.current.x) * k;
    tilt.current.y += (targetY - tilt.current.y) * k;
    orient.current.rotation.x = Math.PI / 2 + tilt.current.x;
    orient.current.rotation.y = tilt.current.y;
  });

  return (
    <group ref={orient} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={spin}>
        {/* Invisible drag collider (raycast target for grab-and-flick) */}
        <mesh
          onPointerDown={(e) => {
            e.stopPropagation();
            dragging.current = true;
            lastX.current = e.clientX;
            lastT.current = performance.now();
            gl.domElement.style.cursor = 'grabbing';
          }}
          onPointerOver={() => {
            if (!dragging.current) gl.domElement.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            if (!dragging.current) gl.domElement.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[R_OUT + 0.5, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Tread band (rubber + procedural bump + subtle clearcoat sheen) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[R_OUT, R_OUT, WIDTH, 96, 1, true]} />
          <meshPhysicalMaterial
            color="#0a0a0b"
            roughness={0.82}
            metalness={0}
            clearcoat={0.25}
            clearcoatRoughness={0.55}
            bumpMap={treadBump}
            bumpScale={0.07}
          />
        </mesh>

        {/* Tread blocks */}
        {treadBlocks.map((b, i) => (
          <mesh key={i} position={b.position} rotation={[0, b.rotationY, 0]} castShadow>
            <boxGeometry args={[0.16, WIDTH * 0.82, 0.14]} />
            <meshStandardMaterial color="#141416" roughness={0.9} metalness={0.05} />
          </mesh>
        ))}

        {/* Rounded outer shoulders */}
        {[WIDTH / 2, -WIDTH / 2].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[R_OUT - 0.16, 0.2, 20, 80]} />
            <meshPhysicalMaterial color="#070709" roughness={0.74} metalness={0.05} clearcoat={0.3} clearcoatRoughness={0.5} />
          </mesh>
        ))}

        {/* Closed sidewall faces (annulus tread→rim, so the tyre reads solid) */}
        {[
          { y: WIDTH / 2 - 0.02, rx: -Math.PI / 2 },
          { y: -WIDTH / 2 + 0.02, rx: Math.PI / 2 },
        ].map((s, i) => (
          <mesh key={i} position={[0, s.y, 0]} rotation={[s.rx, 0, 0]} receiveShadow>
            <ringGeometry args={[R_RIM - 0.02, R_OUT - 0.14, 80, 1]} />
            <meshPhysicalMaterial color="#080809" roughness={0.7} metalness={0.04} clearcoat={0.35} clearcoatRoughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        ))}

        {/* Moulded sidewall lettering (raised rubber, both sides) */}
        {[
          { y: WIDTH / 2 - 0.005, rx: -Math.PI / 2 },
          { y: -WIDTH / 2 + 0.005, rx: Math.PI / 2 },
        ].map((s, i) => (
          <mesh key={i} position={[0, s.y, 0]} rotation={[s.rx, 0, 0]}>
            <ringGeometry args={[SW_IN, SW_OUT, 96, 1]} />
            <meshStandardMaterial
              color="#ffffff"
              map={sidewallText}
              roughness={0.72}
              metalness={0.04}
              bumpMap={sidewallText}
              bumpScale={0.07}
            />
          </mesh>
        ))}

        {/* Alloy rim disc */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[R_RIM, R_RIM, WIDTH * 0.45, 48]} />
          <meshStandardMaterial color="#c7ccd4" roughness={0.28} metalness={1} envMapIntensity={1.1} />
        </mesh>

        {/* Recessed rim face */}
        <mesh position={[0, WIDTH * 0.24, 0]}>
          <cylinderGeometry args={[R_RIM - 0.08, R_RIM - 0.08, WIDTH * 0.06, 48]} />
          <meshStandardMaterial color="#2b2d31" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Spokes */}
        {spokes.map((s, i) => (
          <group key={i} rotation={[0, s.rotationY, 0]}>
            <mesh position={[0.78, WIDTH * 0.18, 0]} castShadow>
              <boxGeometry args={[0.95, 0.12, 0.26]} />
              <meshStandardMaterial color="#d2d6dd" roughness={0.26} metalness={1} envMapIntensity={1.1} />
            </mesh>
          </group>
        ))}

        {/* Hub */}
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, WIDTH * 0.6, 32]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.4} metalness={0.95} />
        </mesh>

        {/* Gold hub cap base (emissive → blooms) */}
        <mesh position={[0, WIDTH * 0.32, 0]}>
          <cylinderGeometry args={[0.36, 0.34, WIDTH * 0.1, 32]} />
          <meshStandardMaterial color="#A67C3C" roughness={0.3} metalness={1} emissive="#A67C3C" emissiveIntensity={0.5} />
        </mesh>

        {/* Branded Ž medallion on the cap face (spins with the wheel) */}
        <mesh position={[0, WIDTH * 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.34, 48]} />
          <meshStandardMaterial map={logoTex} roughness={0.34} metalness={0.85} emissiveMap={logoTex} emissive="#A67C3C" emissiveIntensity={0.25} />
        </mesh>

        {/* Gold accent ring (emissive → blooms) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R_RIM - 0.02, 0.045, 12, 64]} />
          <meshStandardMaterial color="#A67C3C" roughness={0.32} metalness={1} emissive="#A67C3C" emissiveIntensity={0.6} envMapIntensity={1.2} />
        </mesh>

        {/* Lug nuts */}
        {lugs.map((l, i) => (
          <mesh key={i} position={[l.position[0], WIDTH * 0.3, l.position[2]]}>
            <cylinderGeometry args={[0.06, 0.06, WIDTH * 0.1, 6]} />
            <meshStandardMaterial color="#9aa0a8" roughness={0.35} metalness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
