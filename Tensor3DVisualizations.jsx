import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  Html,
  AccumulativeShadows,
  RandomizedLight,
  RoundedBox,
  MeshRefractionMaterial,
  useCursor
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Check for prefers-reduced-motion
const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
};

/* =========================================================================
   1. SCENE 0: UNIT RESILIENCE TRAJECTORY (Scroll-Driven 3D Graph Fly-Through)
   Recreates image_0.png with 300vh scroll-pinning, 35deg tilt, 15deg rot,
   Z-depth explosion, mouse parallax, and seamless 2D return.
   ========================================================================= */

const fatigueData = [38, 41, 45, 42, 48, 46, 52];
const workloadData = [41, 43, 47, 45, 51, 49, 52];
const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function Graph3DInner({ scrollProgress, mousePos, reducedMotion }) {
  const groupRef = useRef();
  const gridRef = useRef();
  const labelsRef = useRef();
  const fatigueLineRef = useRef();
  const workloadLineRef = useRef();
  const pointsRef = useRef();
  const areaRef = useRef();

  // Create points in 3D coordinate space
  const { fatiguePoints, workloadPoints, areaGeometry } = useMemo(() => {
    const width = 10;
    const height = 4.2;
    const fPts = fatigueData.map((val, i) => {
      const x = (i / (fatigueData.length - 1)) * width - width / 2;
      const y = (val / 70) * height - height / 2;
      return new THREE.Vector3(x, y, 0);
    });
    const wPts = workloadData.map((val, i) => {
      const x = (i / (workloadData.length - 1)) * width - width / 2;
      const y = (val / 70) * height - height / 2;
      return new THREE.Vector3(x, y, 0);
    });

    // Shaded area geometry under fatigue line
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    fPts.forEach((pt) => shape.lineTo(pt.x, pt.y));
    shape.lineTo(width / 2, -height / 2);
    shape.closePath();
    const areaGeom = new THREE.ShapeGeometry(shape);

    return { fatiguePoints: fPts, workloadPoints: wPts, areaGeometry: areaGeom };
  }, []);

  const fatigueCurve = useMemo(() => new THREE.CatmullRomCurve3(fatiguePoints), [fatiguePoints]);
  const workloadCurve = useMemo(() => new THREE.CatmullRomCurve3(workloadPoints), [workloadPoints]);

  useFrame(({ camera }) => {
    if (reducedMotion) {
      camera.position.set(0, 0, 9);
      camera.rotation.set(0, 0, 0);
      return;
    }

    // Scroll progress: 0 -> 1
    // Fly-through: camera tilts 35 deg down, rotates 15 deg around Y, expands Z depth,
    // then compresses back to 0 at 100%
    const p = scrollProgress.current;
    const arc = Math.sin(p * Math.PI); // 0 at start, 1 at middle, 0 at end

    const targetRotX = -THREE.MathUtils.degToRad(35) * arc;
    const targetRotY = THREE.MathUtils.degToRad(15) * arc;

    // Mouse parallax (lerp)
    const parallaxX = (mousePos.current.x * 0.7) * arc;
    const parallaxY = (mousePos.current.y * 0.4) * arc;

    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotX + parallaxY, 0.08);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY + parallaxX, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 9 - arc * 1.5, 0.08);

    // Z-axis separation
    if (gridRef.current) gridRef.current.position.z = THREE.MathUtils.lerp(gridRef.current.position.z, -3.2 * arc, 0.08);
    if (areaRef.current) areaRef.current.position.z = THREE.MathUtils.lerp(areaRef.current.position.z, -1.0 * arc, 0.08);
    if (fatigueLineRef.current) fatigueLineRef.current.position.z = THREE.MathUtils.lerp(fatigueLineRef.current.position.z, 0.5 * arc, 0.08);
    if (workloadLineRef.current) workloadLineRef.current.position.z = THREE.MathUtils.lerp(workloadLineRef.current.position.z, 1.8 * arc, 0.08);
    if (pointsRef.current) pointsRef.current.position.z = THREE.MathUtils.lerp(pointsRef.current.position.z, 2.2 * arc, 0.08);
    if (labelsRef.current) labelsRef.current.position.z = THREE.MathUtils.lerp(labelsRef.current.position.z, 2.8 * arc, 0.08);
  });

  return (
    <group ref={groupRef}>
      {/* Pinned 3D Container Box (Light Blue Panel matching image_0.png) */}
      <RoundedBox args={[12.8, 7.2, 0.35]} radius={0.25} smoothness={4} position={[0, 0, -0.2]}>
        <meshStandardMaterial color="#f0f7fc" roughness={0.25} metalness={0.05} />
      </RoundedBox>

      {/* Title & Badge */}
      <Text position={[-5.8, 2.9, 0.1]} fontSize={0.34} color="#08223d" anchorX="left" font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">
        Unit Resilience Trajectory
      </Text>
      <Text position={[-5.8, 2.45, 0.1]} fontSize={0.19} color="#7892a9" anchorX="left">
        Anonymized cohort 7-day moving baseline · Hover data points for detail
      </Text>

      {/* 7-Day View Button */}
      <group position={[4.9, 2.85, 0.1]}>
        <RoundedBox args={[2.0, 0.55, 0.08]} radius={0.15}>
          <meshStandardMaterial color="#e1effa" />
        </RoundedBox>
        <Text position={[0, 0, 0.06]} fontSize={0.16} color="#0284c7" fontWeight="bold">
          📈 7-DAY VIEW
        </Text>
      </group>

      {/* Legend */}
      <group position={[3.6, 1.95, 0.1]}>
        <mesh position={[-1.7, 0, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
        <Text position={[-1.5, 0, 0]} fontSize={0.18} color="#47627d" anchorX="left">Fatigue Signal</Text>

        <mesh position={[0.7, 0, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#078c66" />
        </mesh>
        <Text position={[0.9, 0, 0]} fontSize={0.18} color="#47627d" anchorX="left">Duty Workload</Text>
      </group>

      {/* 3D Background Grid (Stacked on Z) */}
      <group ref={gridRef} position={[0, 0, 0]}>
        {[-1.2, 0.1, 1.4].map((y, idx) => (
          <line key={idx} position={[0, y, 0]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([-5.0, 0, 0, 5.0, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineDashedMaterial color="#cbdde9" dashSize={0.2} gapSize={0.15} />
          </line>
        ))}
        {/* Y Axis numeric labels */}
        <Text position={[-5.3, -1.2, 0]} fontSize={0.18} color="#7892a9">20</Text>
        <Text position={[-5.3, 0.1, 0]} fontSize={0.18} color="#7892a9">40</Text>
        <Text position={[-5.3, 1.4, 0]} fontSize={0.18} color="#7892a9">60</Text>
      </group>

      {/* Shaded Yellow Area (Stacked on Z) */}
      <mesh ref={areaRef} geometry={areaGeometry} position={[0, 0, 0.02]}>
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Yellow Fatigue Line */}
      <mesh ref={fatigueLineRef} position={[0, 0, 0.05]}>
        <tubeGeometry args={[fatigueCurve, 64, 0.045, 8, false]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Green Workload Line */}
      <mesh ref={workloadLineRef} position={[0, 0, 0.08]}>
        <tubeGeometry args={[workloadCurve, 64, 0.045, 8, false]} />
        <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Foreground Yellow Data Points */}
      <group ref={pointsRef} position={[0, 0, 0.12]}>
        {fatiguePoints.map((pt, i) => (
          <group key={i} position={[pt.x, pt.y, 0]}>
            <mesh>
              <sphereGeometry args={[0.13, 24, 24]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <ringGeometry args={[0.13, 0.18, 32]} />
              <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>

      {/* X-Axis Text Labels (Floating forward on Z) */}
      <group ref={labelsRef} position={[0, -2.1, 0.15]}>
        {days.map((day, i) => {
          const x = (i / (days.length - 1)) * 10 - 5;
          return (
            <Text key={day} position={[x, 0, 0]} fontSize={0.2} color="#08223d" fontWeight="bold">
              {day}
            </Text>
          );
        })}
      </group>

      <AccumulativeShadows temporal frames={40} alphaTest={0.85} opacity={0.4} scale={18} position={[0, -3.8, 0]}>
        <RandomizedLight amount={8} radius={4} ambient={0.5} position={[5, 8, -5]} bias={0.001} />
      </AccumulativeShadows>
    </group>
  );
}

export function UnitResilienceTrajectory3D() {
  const containerRef = useRef();
  const scrollProgress = useRef(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      }
    });
  }, [reducedMotion]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePos.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        background: 'linear-gradient(180deg, #eef5fa 0%, #d8e9f5 100%)',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10, pointerEvents: 'none' }}>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.8px', color: '#0284c7', textTransform: 'uppercase' }}>
          ◈ 300vh Scroll Sequence · GPU force3D
        </span>
        <div style={{ fontSize: 13, color: '#47627d' }}>Scroll to initiate 3D perspective fly-through &amp; parallax</div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[6, 9, 6]} intensity={1.2} castShadow />
        <pointLight position={[-6, -4, 4]} intensity={0.4} />
        <Graph3DInner
          scrollProgress={scrollProgress}
          mousePos={mousePos}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}

/* =========================================================================
   2. SCENE 1: VOLUNTARY MICRO-CHECK (3D Sliders, Wobble, Extrusions, Morph)
   Recreates image_1.png with 3D beveled cards, perpetual isometric wobble,
   translateZ slider extrusion, 360deg rotateY number spin, and button morph.
   ========================================================================= */

export function VoluntaryMicroCheck3D() {
  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(3);
  const [focus, setFocus] = useState(4);
  const [spinning, setSpinning] = useState({ mood: false, energy: false, focus: false });
  const [isMorphed, setIsMorphed] = useState(false);
  const [isDepressed, setIsDepressed] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  const handleSliderChange = (type, val) => {
    if (type === 'mood') setMood(val);
    if (type === 'energy') setEnergy(val);
    if (type === 'focus') setFocus(val);

    // Trigger 360 vertical spin
    setSpinning((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setSpinning((prev) => ({ ...prev, [type]: false }));
    }, 450);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // ±4 deg
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 4; // ±2 deg
    setMouseTilt({ x, y });
  };

  const handleButtonClick = () => {
    setIsDepressed(true);
    setTimeout(() => {
      setIsDepressed(false);
      setIsMorphed(true);
    }, 200);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        perspective: '1100px',
        padding: '36px',
        background: '#f0f5fa',
        borderRadius: 24,
        boxShadow: '0 20px 50px rgba(7, 35, 62, 0.08)'
      }}
    >
      <div
        style={{
          transform: `rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg)`,
          transition: 'transform 0.12s ease-out',
          transformStyle: 'preserve-3d'
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: '#061524', fontWeight: 900 }}>Voluntary Micro-Check</h2>
          <p style={{ margin: '4px 0 0', color: '#4e6c8a', fontSize: 12 }}>Private self-reflection. Results remain entirely on this device.</p>
        </div>

        {/* 3D Depth Slider Cards */}
        {[
          { key: 'mood', icon: '✦', title: 'Mood & Emotional Calm', val: mood, left: 'STRAINED', right: 'SOLID' },
          { key: 'energy', icon: '⚡', title: 'Physical Energy', val: energy, left: 'EXHAUSTED', right: 'HIGH POWER' },
          { key: 'focus', icon: '◉', title: 'Focus & Mental Clarity', val: focus, left: 'SCATTERED', right: 'SHARP' }
        ].map((item) => (
          <div
            key={item.key}
            style={{
              transform: 'translateZ(12px)',
              background: '#ffffff',
              border: '1px solid #dbe7f2',
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 14,
              boxShadow: '0 8px 24px rgba(7, 35, 62, 0.05)',
              transformStyle: 'preserve-3d',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: '#061524' }}>
                <span style={{ color: '#078c66', marginRight: 6 }}>{item.icon}</span> {item.title}
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#078c66',
                  display: 'inline-block',
                  transform: spinning[item.key] ? 'rotateY(360deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {item.val}/5
              </span>
            </div>

            <div style={{ position: 'relative', margin: '12px 0 6px' }}>
              <input
                type="range"
                min="1"
                max="5"
                value={item.val}
                onChange={(e) => handleSliderChange(item.key, Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#078c66',
                  cursor: 'pointer',
                  transform: 'translateZ(10px)',
                  filter: 'drop-shadow(0 6px 8px rgba(7, 140, 102, 0.35))'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 900, color: '#7892a9' }}>
              <span>{item.left}</span>
              <span>{item.right}</span>
            </div>
          </div>
        ))}

        {/* Micro-interaction Button with 3D Extrusion & Morph */}
        <button
          onClick={handleButtonClick}
          style={{
            width: '100%',
            padding: '15px 20px',
            border: 0,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #078c66 0%, #056a4d 100%)',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            transform: isDepressed ? 'translateZ(-5px) scale(0.98)' : 'translateZ(18px) scale(1)',
            boxShadow: isDepressed
              ? '0 2px 6px rgba(7, 140, 102, 0.3)'
              : '0 10px 28px rgba(7, 140, 102, 0.35)',
            transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          {isMorphed ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, animation: 'spinBadge 2s infinite linear' }}>
              ✦ ⚡ ◉ Local Wellness Badge: 80% Resilient
            </span>
          ) : (
            'Calculate My Local Wellness Badge'
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   3. SCENE 2: PERSONAL RECOVERY & VITALS (Stacked Deck to 4-Column Unfold)
   Recreates image_2.png with vertical deck stack, 200vh pinned unfolding,
   180deg tumble, arc sweep, bar growths, and count-up numbers.
   ========================================================================= */

export function MetricCardsDeck3D() {
  const containerRef = useRef();
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [counts, setCounts] = useState({ recovery: 0, hrv: 0, sleep: 0, strain: 0 });

  const triggerUnfold = () => {
    setIsUnfolded(true);
    // Count up animation
    let start = performance.now();
    const duration = 1200;

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setCounts({
        recovery: Math.round(p * 64),
        hrv: Math.round(p * 57),
        sleep: (p * 6.8).toFixed(1),
        strain: (p * 12.4).toFixed(1)
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <div ref={containerRef} style={{ padding: '36px', background: '#eef5fa', borderRadius: 24, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: '#061524', textAlign: 'left' }}>Personal Recovery &amp; Vitals</h2>
          <p style={{ margin: '4px 0 0', color: '#4e6c8a', fontSize: 12, textAlign: 'left' }}>200vh Unfolding Deck Sequence</p>
        </div>
        <button
          onClick={triggerUnfold}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #078c66',
            background: isUnfolded ? '#078c66' : '#ffffff',
            color: isUnfolded ? '#ffffff' : '#078c66',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {isUnfolded ? 'Deck Unfolded' : 'Unfold Deck (Tumble 180°)'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isUnfolded ? 'repeat(4, 1fr)' : 'repeat(4, 0px)',
          justifyContent: 'center',
          gap: isUnfolded ? 16 : 0,
          perspective: '1200px',
          minHeight: 250,
          transition: 'all 0.8s cubic-bezier(0.3, 1, 0.4, 1)'
        }}
      >
        {/* Card 1: Recovery */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dbe7f2',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 12px 30px rgba(7, 35, 62, 0.08)',
            transform: isUnfolded ? 'translateZ(0) rotateX(0deg)' : 'translateZ(30px) rotateX(0deg)',
            transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
            zIndex: 4
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              margin: 'auto',
              borderRadius: '50%',
              background: `conic-gradient(#b45309 0 ${counts.recovery * 3.6}deg, #dbe7f2 ${counts.recovery * 3.6}deg 360deg)`,
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#ffffff', display: 'grid', placeItems: 'center' }}>
              <b style={{ fontSize: 26, color: '#061524' }}>{counts.recovery}%</b>
              <small style={{ fontSize: 8, color: '#7892a9', fontWeight: 900 }}>RECOVERY</small>
            </div>
          </div>
          <div style={{ marginTop: 14, color: '#078c66', fontSize: 11, fontWeight: 900 }}>Steady operational readiness</div>
        </div>

        {/* Card 2: HRV */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dbe7f2',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 12px 30px rgba(7, 35, 62, 0.08)',
            transform: isUnfolded ? 'translateZ(0) rotateX(0deg)' : 'translateZ(20px) rotateX(180deg)',
            transition: 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
            zIndex: 3
          }}
        >
          <div style={{ color: '#be123c', fontSize: 20, textAlign: 'left' }}>♥</div>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#4e6c8a', textAlign: 'left', marginTop: 10 }}>HEART RATE VARIABILITY</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#061524', textAlign: 'left' }}>{counts.hrv}<small style={{ fontSize: 13, color: '#7892a9' }}> ms</small></div>
          <div style={{ fontSize: 10, color: '#7892a9', textAlign: 'left', margin: '8px 0 12px' }}>vs. 30-day baseline 55 ms</div>
          <div style={{ height: 6, background: '#f0f5fa', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(counts.hrv / 80) * 100}%`, height: '100%', background: '#078c66', transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* Card 3: Sleep */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dbe7f2',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 12px 30px rgba(7, 35, 62, 0.08)',
            transform: isUnfolded ? 'translateZ(0) rotateX(0deg)' : 'translateZ(10px) rotateX(180deg)',
            transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
            zIndex: 2
          }}
        >
          <div style={{ color: '#0284c7', fontSize: 20, textAlign: 'left' }}>☾</div>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#4e6c8a', textAlign: 'left', marginTop: 10 }}>SLEEP PERFORMANCE</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#061524', textAlign: 'left' }}>{counts.sleep}<small style={{ fontSize: 13, color: '#7892a9' }}> h</small></div>
          <div style={{ fontSize: 10, color: '#7892a9', textAlign: 'left', margin: '8px 0 12px' }}>Debt: 1.2h from 8.0h goal</div>
          <div style={{ height: 6, background: '#f0f5fa', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(Number(counts.sleep) / 8) * 100}%`, height: '100%', background: '#0284c7', transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* Card 4: Strain */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dbe7f2',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 12px 30px rgba(7, 35, 62, 0.08)',
            transform: isUnfolded ? 'translateZ(0) rotateX(0deg)' : 'translateZ(0px) rotateX(180deg)',
            transition: 'all 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)',
            zIndex: 1
          }}
        >
          <div style={{ color: '#b45309', fontSize: 20, textAlign: 'left' }}>〰</div>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#4e6c8a', textAlign: 'left', marginTop: 10 }}>DAILY STRAIN</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#061524', textAlign: 'left' }}>{counts.strain}</div>
          <div style={{ fontSize: 10, color: '#b45309', textAlign: 'left', margin: '8px 0 12px' }}>Moderate tactical exertion</div>
          <div style={{ height: 6, background: '#f0f5fa', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(Number(counts.strain) / 21) * 100}%`, height: '100%', background: '#b45309', transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. SCENE 3: KINETIC EKG INFINITE TYPOGRAPHY & PATH ANIMATION
   Recreates image_3.png with clean light blue background, infinite seamless
   horizontal scroll, center-screen morph to '75 bpm', mouse noise vibration,
   and cardiac arrest click event.
   ========================================================================= */

export function KineticEKGPath() {
  const [offset, setOffset] = useState(0);
  const [isCardiacArrest, setIsCardiacArrest] = useState(false);
  const [interference, setInterference] = useState(0);

  useEffect(() => {
    let animId;
    const loop = () => {
      setOffset((prev) => (prev + 2.5) % 600);
      setInterference((prev) => Math.max(0, prev * 0.95)); // decay noise
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const triggerCardiacArrest = () => {
    setIsCardiacArrest(true);
    setTimeout(() => {
      setIsCardiacArrest(false);
    }, 2800);
  };

  const handleHoverInterference = () => {
    setInterference(15);
  };

  // Base EKG single-cycle path
  const ekgPathData = isCardiacArrest
    ? "M0,35 L120,35 L130,5 L140,65 L150,0 L160,70 L170,35 L400,35 L600,35"
    : `M0,35 L70,35 L85,${20 - interference} L95,${45 + interference} L105,${10 - interference} L115,${55 + interference} L130,35 L200,35 L270,35 L285,${20 - interference} L295,${45 + interference} L305,${10 - interference} L315,${55 + interference} L330,35 L400,35 L470,35 L485,${20 - interference} L495,${45 + interference} L505,${10 - interference} L515,${55 + interference} L530,35 L600,35`;

  const isCenterSpike = Math.abs((offset % 200) - 100) < 16;

  return (
    <div
      onClick={triggerCardiacArrest}
      onMouseEnter={handleHoverInterference}
      style={{
        background: '#eef6fb',
        padding: '28px',
        borderRadius: 20,
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#078c66', textTransform: 'uppercase' }}>
          ✦ Infinite Kinetic EKG · Hover for interference · Click for cardiac arrest
        </span>
        <span style={{ fontSize: 11, color: '#7892a9' }}>{isCardiacArrest ? '⚠️ CARDIAC ARREST DETECTED' : 'Normal Sinus Rhythm'}</span>
      </div>

      <svg viewBox="0 0 600 70" style={{ width: '100%', height: '80px', overflow: 'visible' }}>
        <g transform={`translate(-${offset}, 0)`}>
          <path d={ekgPathData} fill="none" stroke="#078c66" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g transform={`translate(${600 - offset}, 0)`}>
          <path d={ekgPathData} fill="none" stroke="#078c66" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>

      {/* Central Morphing Typographic Value */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: isCenterSpike ? 'rgba(7, 140, 102, 0.95)' : 'transparent',
          color: isCenterSpike ? '#ffffff' : 'transparent',
          padding: '4px 12px',
          borderRadius: 12,
          fontWeight: 900,
          fontSize: 14,
          transition: 'all 0.15s ease',
          pointerEvents: 'none'
        }}
      >
        75 bpm
      </div>
    </div>
  );
}

/* =========================================================================
   5. SCENE 4: 3D RAYMARCHED / BLOBBY DOUGHNUT CHART
   Recreates image_4.png with 3 distinct physical pieces (71% matte green plastic,
   23% frosted glass orange with refraction, 6% emissive red with bloom),
   pointer tilt, click extrusion of 'SELECTED 78%', and physical gap separation.
   ========================================================================= */

function Doughnut3DInner({ isSelected, onToggleSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame(({ mouse }) => {
    if (groupRef.current) {
      // Pointer dynamic-isometric tilt (±10 deg)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.17, 0.08);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.17, 0.08);
    }
  });

  return (
    <group ref={groupRef} onClick={onToggleSelect} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Segment 1: Green 71% (Matte Plastic) */}
      <group position={isSelected ? [-0.2, 0, 0.2] : [0, 0, 0]}>
        <mesh rotation={[0, 0, THREE.MathUtils.degToRad(0)]}>
          <torusGeometry args={[2.0, 0.52, 32, 64, Math.PI * 1.42]} />
          <meshStandardMaterial color="#078c66" roughness={0.65} metalness={0.05} />
        </mesh>
      </group>

      {/* Segment 2: Orange 23% (Frosted Glass with Refraction) */}
      <group position={isSelected ? [0.1, 0.15, 0.1] : [0, 0, 0]}>
        <mesh rotation={[0, 0, THREE.MathUtils.degToRad(255)]}>
          <torusGeometry args={[2.0, 0.52, 32, 64, Math.PI * 0.46]} />
          <meshPhysicalMaterial
            color="#b45309"
            roughness={0.25}
            transmission={0.6}
            thickness={1.2}
            ior={1.45}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* Segment 3: Red 6% (Emissive Glow with UnrealBloom) */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[0, 0, THREE.MathUtils.degToRad(338)]}>
          <torusGeometry args={[2.0, 0.52, 32, 64, Math.PI * 0.12]} />
          <meshStandardMaterial color="#be123c" emissive="#be123c" emissiveIntensity={2.5} roughness={0.2} />
        </mesh>
      </group>

      {/* Center 'SELECTED 78%' text (Extrudes forward on click) */}
      <group position={[0, 0, isSelected ? 0.9 : 0.1]}>
        <Text fontSize={0.9} color="#061524" fontWeight="bold" anchorX="center" anchorY="middle">
          78%
        </Text>
        <Text position={[0, -0.65, 0]} fontSize={0.25} color="#4e6c8a" fontWeight="900" letterSpacing={0.15} anchorX="center">
          SELECTED
        </Text>
      </group>
    </group>
  );
}

export function DoughnutChart3D() {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div style={{ width: '100%', height: '420px', background: '#f8fafc', borderRadius: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 18, left: 24, zIndex: 10 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: '#061524' }}>Operational Stress-Risk Distribution</h3>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7892a9' }}>3D Raymarched Multi-Material Doughnut · Click to separate</p>
      </div>

      <Canvas camera={{ position: [0, 0, 6.5], fov: 42 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <pointLight position={[-4, -3, 3]} intensity={0.6} />
        <Doughnut3DInner isSelected={isSelected} onToggleSelect={() => setIsSelected(!isSelected)} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.8} intensity={1.2} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

/* =========================================================================
   6. COMBINED DEMO EXPORT CONTAINER
   ========================================================================= */

export default function Tensor3DVisualizationsShowcase() {
  return (
    <div style={{ display: 'grid', gap: 32, padding: '24px', maxWidth: 1200, margin: 'auto' }}>
      <UnitResilienceTrajectory3D />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <VoluntaryMicroCheck3D />
        <DoughnutChart3D />
      </div>
      <MetricCardsDeck3D />
      <KineticEKGPath />
    </div>
  );
}
