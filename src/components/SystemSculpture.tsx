import { useEffect, useRef, useState } from 'react';
import type * as Three from 'three';

type SceneActions = { redraw: () => void; reset: () => void };

/** An original, procedural product study. All rendering stays on the client. */
export default function SystemSculpture() {
  const canvasHost = useRef<HTMLDivElement>(null);
  const actions = useRef<SceneActions | null>(null);
  const explodedRef = useRef(false);
  const pausedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const host = canvasHost.current;
    if (!host) return;
    let disposed = false;
    let teardown = () => {};
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);

    void import('three').then((THREE) => {
      if (disposed) return;
      const geometries = new Set<Three.BufferGeometry>();
      const materials = new Set<Three.Material>();
      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch {
        setUnavailable(true);
        return;
      }

      const color = (name: string, fallback: string) =>
        getComputedStyle(host).getPropertyValue(name).trim() || fallback;
      const palette = {
        background: color('--scene-background', '#e4e5e2'),
        shell: color('--scene-shell', '#d6d8d4'),
        metal: color('--scene-metal', '#aeb3b0'),
        graphite: color('--scene-graphite', '#353a39'),
        trace: color('--scene-trace', '#727c75'),
        glyph: color('--scene-glyph', '#f7fbef'),
        accent: color('--scene-accent', '#dd3c29'),
        brightMetal: color('--scene-bright-metal', '#edf0eb'),
        core: color('--scene-core', '#222726'),
        glass: color('--scene-glass', '#a8b6ad'),
        light: color('--scene-light', '#ffffff'),
        bounce: color('--scene-bounce', '#69716d'),
        rim: color('--scene-rim', '#e5efed'),
        shadow: color('--scene-shadow', '#56625b'),
      };
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setClearColor(palette.background, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      host.appendChild(renderer.domElement);
      // Also cover failures during scene construction, before listeners exist.
      teardown = () => {
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((surface) => surface.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        actions.current = null;
      };

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
      camera.position.set(0, 0.1, 10.8);
      camera.lookAt(0, 0, 0);
      const world = new THREE.Group();
      world.rotation.set(-0.19, -0.38, -0.24);
      world.position.y = 0.06;
      scene.add(world);

      const material = (options: Three.MeshStandardMaterialParameters) => {
        const value = new THREE.MeshStandardMaterial(options);
        materials.add(value);
        return value;
      };
      const shell = material({ color: palette.shell, metalness: 0.52, roughness: 0.42 });
      const metal = material({ color: palette.metal, metalness: 0.75, roughness: 0.3 });
      const brightMetal = material({ color: palette.brightMetal, metalness: 0.65, roughness: 0.33 });
      const darkMetal = material({ color: palette.graphite, metalness: 0.45, roughness: 0.39 });
      const dark = material({ color: palette.core, metalness: 0.16, roughness: 0.71 });
      const trace = material({ color: palette.trace, metalness: 0.68, roughness: 0.45 });
      const white = material({ color: palette.glyph, emissive: palette.glyph, emissiveIntensity: 0.65, roughness: 0.32 });
      const accent = material({ color: palette.accent, metalness: 0.2, roughness: 0.58 });
      const glass = material({ color: palette.glass, transparent: true, opacity: 0.14, metalness: 0.1, roughness: 0.21, depthWrite: false });

      const mesh = <T extends Three.BufferGeometry>(geometry: T, surface: Three.Material, parent: Three.Object3D, x = 0, y = 0, z = 0) => {
        geometries.add(geometry);
        const object = new THREE.Mesh(geometry, surface);
        object.position.set(x, y, z);
        object.castShadow = true;
        object.receiveShadow = true;
        parent.add(object);
        return object;
      };
      const box = (w: number, h: number, d: number, surface: Three.Material, parent: Three.Object3D, x = 0, y = 0, z = 0) =>
        mesh(new THREE.BoxGeometry(w, h, d), surface, parent, x, y, z);
      const disc = (r: number, d: number, surface: Three.Material, parent: Three.Object3D, x = 0, y = 0, z = 0) => {
        const object = mesh(new THREE.CylinderGeometry(r, r, d, 96), surface, parent, x, y, z);
        object.rotation.x = Math.PI / 2;
        return object;
      };
      const ring = (radius: number, width: number, depth: number, surface: Three.Material, parent: Three.Object3D, z = 0, start = 0, length = Math.PI * 2) => {
        const shape = new THREE.Shape();
        const innerRadius = radius - width;
        shape.absarc(0, 0, radius, start, start + length, false);
        if (length >= Math.PI * 2) {
          // A true hole avoids a degenerate seam in closed concentric rings.
          const hole = new THREE.Path();
          hole.absarc(0, 0, innerRadius, start, start + length, true);
          shape.holes.push(hole);
        } else {
          shape.absarc(0, 0, innerRadius, start + length, start, true);
        }
        shape.closePath();
        return mesh(new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: false, curveSegments: 96 }), surface, parent, 0, 0, z);
      };
      const roundedPlate = (width: number, height: number, depth: number, radius: number, surface: Three.Material, parent: Three.Object3D, z: number) => {
        const x = -width / 2;
        const y = -height / 2;
        const path = new THREE.Shape();
        path.moveTo(x + radius, y);
        path.lineTo(x + width - radius, y);
        path.quadraticCurveTo(x + width, y, x + width, y + radius);
        path.lineTo(x + width, y + height - radius);
        path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        path.lineTo(x + radius, y + height);
        path.quadraticCurveTo(x, y + height, x, y + height - radius);
        path.lineTo(x, y + radius);
        path.quadraticCurveTo(x, y, x + radius, y);
        return mesh(new THREE.ExtrudeGeometry(path, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.045, bevelThickness: 0.04, curveSegments: 12 }), surface, parent, 0, 0, z);
      };
      const screw = (parent: Three.Object3D, x: number, y: number, z: number, large = false) => {
        const radius = large ? 0.081 : 0.057;
        disc(radius, 0.025, metal, parent, x, y, z);
        box(radius * 1.25, 0.015, 0.012, dark, parent, x, y, z + 0.019).rotation.z = 0.5;
        box(0.015, radius * 1.25, 0.012, dark, parent, x, y, z + 0.02).rotation.z = 0.5;
      };
      const route = (parent: Three.Object3D, points: number[][], z: number, surface = trace, radius = 0.012) => {
        for (let i = 0; i < points.length - 1; i++) {
          const a = new THREE.Vector3(points[i][0], points[i][1], z);
          const b = new THREE.Vector3(points[i + 1][0], points[i + 1][1], z);
          const delta = b.clone().sub(a);
          const line = mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 5), surface, parent);
          line.position.copy(a.add(b).multiplyScalar(0.5));
          line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
        }
      };

      // Three independently moving assemblies: infrastructure, logic, interface.
      const infrastructure = new THREE.Group();
      const logic = new THREE.Group();
      const face = new THREE.Group();
      world.add(infrastructure, logic, face);
      logic.position.z = 0.19;
      face.position.z = 0.53;

      roundedPlate(3.68, 5.18, 0.14, 0.24, metal, infrastructure, -0.16);
      roundedPlate(3.59, 5.09, 0.06, 0.21, darkMetal, infrastructure, 0.01);
      roundedPlate(3.4, 4.9, 0.028, 0.16, dark, infrastructure, 0.085);
      // Fine, stepped board traces give the object scale without texture assets.
      for (const side of [-1, 1]) {
        for (let index = 0; index < 7; index++) {
          const x = side * (1.09 + index * 0.07);
          const y = -2.16 + index * 0.13;
          route(infrastructure, [[side * 0.12, y], [x - side * 0.14, y], [x, y + 0.14], [x, 0.1 + index * 0.13]], 0.13, trace, 0.008);
        }
        for (let i = 0; i < 6; i++) {
          box(0.15, 0.055, 0.05, metal, infrastructure, side * 1.58, -1.6 + i * 0.16, 0.13);
          disc(0.024, 0.01, trace, infrastructure, side * 1.52, 1.4 + i * 0.11, 0.15);
        }
      }
      box(0.93, 0.69, 0.1, darkMetal, infrastructure, -0.74, -1.87, 0.16);
      box(0.7, 0.48, 0.035, metal, infrastructure, -0.74, -1.87, 0.225);
      for (let index = 0; index < 10; index++) {
        box(0.035, 0.1, 0.025, brightMetal, infrastructure, -1.08 + index * 0.075, -2.24, 0.175);
        box(0.035, 0.1, 0.025, brightMetal, infrastructure, -1.08 + index * 0.075, -1.49, 0.175);
      }
      box(0.38, 0.72, 0.16, accent, infrastructure, 1.04, -1.91, 0.18);
      box(0.28, 0.055, 0.17, brightMetal, infrastructure, 1.04, -2.22, 0.19);
      box(0.28, 0.055, 0.17, brightMetal, infrastructure, 1.04, -1.6, 0.19);
      for (const x of [-1.59, 1.59]) {
        for (const y of [-2.36, 2.36]) screw(infrastructure, x, y, 0.16, true);
      }
      // A small recessed connector and edge fasteners complete the chassis.
      box(0.59, 0.09, 0.12, dark, infrastructure, 0, -2.625, -0.02);
      box(0.42, 0.025, 0.035, trace, infrastructure, 0, -2.676, 0.01);
      box(0.045, 0.58, 0.09, metal, infrastructure, 1.884, 1.25, -0.025);
      for (const x of [-0.38, 0.38]) screw(infrastructure, x, -2.49, 0.12);

      logic.position.y = 0.32;
      face.position.y = 0.32;
      disc(1.56, 0.09, darkMetal, logic, 0, 0, 0.08);
      ring(1.53, 0.15, 0.12, shell, logic, 0.12);
      disc(1.365, 0.13, metal, logic, 0, 0, 0.105);
      ring(1.35, 0.065, 0.05, darkMetal, logic, 0.195);
      disc(1.266, 0.12, shell, logic, 0, 0, 0.17);
      ring(1.24, 0.085, 0.022, brightMetal, logic, 0.236);
      ring(1.1, 0.015, 0.013, metal, logic, 0.235);
      disc(0.895, 0.07, metal, logic, 0, 0, 0.245);
      disc(0.838, 0.075, darkMetal, logic, 0, 0, 0.265);
      const centerFace = disc(0.769, 0.076, shell, logic, 0, 0, 0.28);
      centerFace.receiveShadow = false;
      // Concentric lathe grooves catch the light as the sculpture moves.
      for (let index = 0; index < 13; index++) {
        const groove = ring(0.34 + index * 0.031, 0.006, 0.004, index % 3 === 0 ? brightMetal : metal, logic, 0.329);
        // Subpixel machined details should not create shadow-map acne.
        groove.castShadow = false;
        groove.receiveShadow = false;
      }
      disc(0.255, 0.014, darkMetal, logic, 0, 0, 0.326);
      disc(0.226, 0.02, shell, logic, 0, 0, 0.338);
      for (let index = 0; index < 32; index++) {
        const angle = index / 32 * Math.PI * 2;
        const groove = box(0.052, 0.014, 0.01, darkMetal, logic, Math.cos(angle) * 1.427, Math.sin(angle) * 1.427, 0.251);
        groove.rotation.z = angle;
      }
      for (let index = 0; index < 4; index++) {
        const angle = Math.PI / 4 + index * Math.PI / 2;
        screw(logic, Math.cos(angle) * 1.43, Math.sin(angle) * 1.43, 0.256);
      }
      // Raised luminous glyph pieces are an interface, not a copied logo.
      const glyphArcs = [[0.19, 1.13], [1.61, 0.66], [2.64, 1.45], [4.52, 1.2]];
      glyphArcs.forEach(([start, length]) => {
        ring(1.656, 0.119, 0.047, darkMetal, face, 0, start, length);
        ring(1.637, 0.073, 0.027, white, face, 0.05, start + 0.012, length - 0.024);
      });
      // A split line and a pill light continue the design onto the lower board.
      box(0.11, 0.73, 0.035, white, face, 0.25, -2.12, 0.02);
      disc(0.055, 0.036, white, face, 0.25, -1.755, 0.02);
      disc(0.055, 0.036, white, face, 0.25, -2.485, 0.02);
      roundedPlate(0.79, 0.43, 0.022, 0.09, glass, face, 0).position.set(-0.71, -2.18, 0.02);
      for (let index = 0; index < 4; index++) {
        box(0.035, 0.09 + index * 0.055, 0.018, white, face, -0.91 + index * 0.12, -2.18, 0.08);
      }
      box(0.36, 0.045, 0.045, white, face, -1.48, 1.93, 0.015).rotation.z = -Math.PI / 4;
      disc(0.052, 0.035, accent, face, 1.45, 2.02, 0.018);

      const ambient = new THREE.HemisphereLight(palette.light, palette.bounce, 1.55);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(palette.light, 2.8);
      key.position.set(-3.5, 5, 7);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -5;
      key.shadow.camera.right = 5;
      key.shadow.camera.top = 5;
      key.shadow.camera.bottom = -5;
      key.shadow.bias = -0.0015;
      key.shadow.normalBias = 0.05;
      key.shadow.radius = 4;
      scene.add(key);
      const rim = new THREE.DirectionalLight(palette.rim, 1.65);
      rim.position.set(4, 0.5, 2);
      scene.add(rim);
      const fill = new THREE.DirectionalLight(palette.light, 0.65);
      fill.position.set(0, -4, 5);
      scene.add(fill);
      const shadowMaterial = new THREE.ShadowMaterial({ color: palette.shadow, opacity: 0.17 });
      materials.add(shadowMaterial);
      const shadowPlane = mesh(new THREE.PlaneGeometry(40, 40), shadowMaterial, scene, 0.1, -0.17, -0.94);
      shadowPlane.castShadow = false;

      let frame = 0;
      let previousTime = 0;
      let elapsed = 0;
      let inViewport = true;
      let lostContext = false;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let targetX = -0.19;
      let targetY = -0.38;
      let currentX = targetX;
      let currentY = targetY;
      let separation = 0;
      const canRender = () => !disposed && !lostContext && inViewport && !document.hidden;
      const draw = (time: number) => {
        frame = 0;
        if (!canRender()) return;
        const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
        previousTime = time;
        const running = !pausedRef.current && !motionQuery.matches && !dragging;
        if (running) elapsed += delta;
        const smoothing = motionQuery.matches ? 1 : 1 - Math.exp(-delta * 9);
        currentX = THREE.MathUtils.lerp(currentX, targetX, smoothing);
        currentY = THREE.MathUtils.lerp(currentY, targetY, smoothing);
        const wantedSeparation = explodedRef.current ? 1 : 0;
        separation = THREE.MathUtils.lerp(separation, wantedSeparation, smoothing);
        world.rotation.x = currentX + Math.sin(elapsed * 0.45) * 0.055;
        world.rotation.y = currentY + Math.sin(elapsed * 0.3) * 0.09;
        world.position.y = 0.06 + Math.sin(elapsed * 0.65) * 0.025;
        infrastructure.position.z = -separation * 0.48;
        logic.position.z = 0.19 + separation * 0.27;
        face.position.z = 0.53 + separation * 1.02;
        renderer.render(scene, camera);
        const settling = Math.abs(currentX - targetX) + Math.abs(currentY - targetY) + Math.abs(separation - wantedSeparation) > 0.001;
        if (running || settling) frame = requestAnimationFrame(draw);
      };
      const redraw = () => {
        if (!frame && canRender()) {
          previousTime = 0;
          frame = requestAnimationFrame(draw);
        }
      };
      const suspend = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      };
      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        // Preserve the product silhouette in a narrow mobile viewport.
        camera.position.z = camera.aspect < 0.9 ? 11.6 / Math.max(camera.aspect / 0.9, 0.7) : 10.8;
        camera.updateProjectionMatrix();
        redraw();
      };
      const reset = () => {
        targetX = -0.19;
        targetY = -0.38;
        elapsed = 0;
        redraw();
      };
      const pointerDown = (event: PointerEvent) => {
        if (event.button !== 0 || lostContext) return;
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        host.setPointerCapture(event.pointerId);
        host.dataset.dragging = 'true';
        host.focus({ preventScroll: true });
      };
      const pointerMove = (event: PointerEvent) => {
        if (!dragging) return;
        targetY = THREE.MathUtils.clamp(targetY + (event.clientX - lastX) * 0.008, -1.12, 1.12);
        targetX = THREE.MathUtils.clamp(targetX + (event.clientY - lastY) * 0.007, -0.85, 0.85);
        lastX = event.clientX;
        lastY = event.clientY;
        redraw();
      };
      const pointerUp = (event: PointerEvent) => {
        dragging = false;
        delete host.dataset.dragging;
        if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
        redraw();
      };
      const keyDown = (event: KeyboardEvent) => {
        if (event.key === 'Home') reset();
        else if (event.key === 'ArrowLeft') targetY = Math.max(-1.12, targetY - 0.13);
        else if (event.key === 'ArrowRight') targetY = Math.min(1.12, targetY + 0.13);
        else if (event.key === 'ArrowUp') targetX = Math.max(-0.85, targetX - 0.13);
        else if (event.key === 'ArrowDown') targetX = Math.min(0.85, targetX + 0.13);
        else return;
        event.preventDefault();
        redraw();
      };
      const visibilityChange = () => { if (document.hidden) suspend(); else redraw(); };
      const motionChange = () => { setReducedMotion(motionQuery.matches); redraw(); };
      const contextLost = (event: Event) => {
        event.preventDefault();
        lostContext = true;
        suspend();
        setReady(false);
        setUnavailable(true);
      };
      const contextRestored = () => {
        lostContext = false;
        setUnavailable(false);
        setReady(true);
        redraw();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        inViewport = entry.isIntersecting;
        if (inViewport) redraw(); else suspend();
      }, { rootMargin: '60px' });
      intersectionObserver.observe(host);
      host.addEventListener('pointerdown', pointerDown);
      host.addEventListener('pointermove', pointerMove);
      host.addEventListener('pointerup', pointerUp);
      host.addEventListener('pointercancel', pointerUp);
      host.addEventListener('lostpointercapture', pointerUp);
      host.addEventListener('keydown', keyDown);
      document.addEventListener('visibilitychange', visibilityChange);
      motionQuery.addEventListener('change', motionChange);
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
      actions.current = { redraw, reset };
      teardown = () => {
        suspend();
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        host.removeEventListener('pointerdown', pointerDown);
        host.removeEventListener('pointermove', pointerMove);
        host.removeEventListener('pointerup', pointerUp);
        host.removeEventListener('pointercancel', pointerUp);
        host.removeEventListener('lostpointercapture', pointerUp);
        host.removeEventListener('keydown', keyDown);
        document.removeEventListener('visibilitychange', visibilityChange);
        motionQuery.removeEventListener('change', motionChange);
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((surface) => surface.dispose());
        key.shadow.map?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        actions.current = null;
      };
      resize();
      renderer.render(scene, camera);
      setReady(true);
    }).catch(() => {
      if (!disposed) {
        teardown();
        setUnavailable(true);
        setReady(false);
      }
    });
    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  const toggleExploded = () => {
    explodedRef.current = !explodedRef.current;
    setExploded(explodedRef.current);
    actions.current?.redraw();
  };
  const togglePaused = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    actions.current?.redraw();
  };

  return (
    <div className={`system-sculpture${ready ? ' is-ready' : ''}`}>
      <div
        ref={canvasHost}
        className="system-sculpture__canvas"
        tabIndex={ready ? 0 : -1}
        role="group"
        aria-label="Interactive three-dimensional system module. Drag or use arrow keys to rotate. Press Home to reset the view."
        style={{ touchAction: 'pan-y' }}
      >
        <StaticSculpture hidden={ready} />
      </div>
      <div className="scene-controls" aria-label="3D model controls">
        <button type="button" onClick={toggleExploded} disabled={!ready} aria-pressed={exploded} aria-label={exploded ? 'Assemble model' : 'Explode view'}>
          <span aria-hidden="true">{exploded ? '−' : '+'}</span> {exploded ? 'Assemble' : 'Explode'}
        </button>
        <button type="button" onClick={togglePaused} disabled={!ready || reducedMotion} aria-pressed={paused || reducedMotion} title={reducedMotion ? 'Motion is off to respect your reduced-motion preference' : undefined}>
          <span aria-hidden="true">{paused || reducedMotion ? '▷' : 'Ⅱ'}</span> {reducedMotion ? 'Motion off' : paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" onClick={() => actions.current?.reset()} disabled={!ready} aria-label="Reset view">Reset <span aria-hidden="true">↺</span></button>
      </div>
      <p className="scene-hint" aria-live="polite">{unavailable ? 'Static preview · 3D unavailable in this browser' : exploded ? '01 Interface  /  02 Logic  /  03 Infrastructure' : 'Drag to explore · Built with Three.js'}</p>
    </div>
  );
}

function StaticSculpture({ hidden }: { hidden: boolean }) {
  return (
    <svg className="system-sculpture__fallback" viewBox="0 0 760 760" aria-hidden="true" style={{ opacity: hidden ? 0 : 1 }}>
      <defs>
        <linearGradient id="sculpture-shell" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--scene-bright-metal)" /><stop offset=".5" stopColor="var(--scene-metal)" /><stop offset="1" stopColor="var(--scene-shell)" /></linearGradient>
        <radialGradient id="sculpture-disc"><stop stopColor="var(--scene-bright-metal)" /><stop offset=".5" stopColor="var(--scene-metal)" /><stop offset=".8" stopColor="var(--scene-shell)" /><stop offset="1" stopColor="var(--scene-glass)" /></radialGradient>
        <filter id="sculpture-shadow"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <ellipse cx="383" cy="574" rx="175" ry="65" fill="var(--scene-shadow)" opacity=".19" filter="url(#sculpture-shadow)" />
      <g transform="translate(380 355) rotate(17) skewY(-7) scale(.92 1)">
        <rect x="-168" y="-244" width="336" height="494" rx="25" fill="var(--scene-trace)" />
        <rect x="-171" y="-252" width="332" height="490" rx="24" fill="url(#sculpture-shell)" />
        <rect x="-161" y="-242" width="312" height="470" rx="16" fill="var(--scene-graphite)" />
        <g stroke="var(--scene-trace)" fill="none" strokeWidth="2">
          <path d="M-120 158V-130h48M-113 169V-115h45M-106 179V-99h44M-99 191V-85h40M120 187h-43v-63l51-40v-179M112 198H59v-78l61-43V-123M-143-202h104v33M-143-193h94v31" />
        </g>
        <circle cy="-30" r="149" fill="var(--scene-core)" stroke="var(--scene-metal)" strokeWidth="8" />
        <circle cy="-30" r="132" fill="url(#sculpture-disc)" stroke="var(--scene-bright-metal)" strokeWidth="12" />
        <circle cy="-30" r="119" fill="none" stroke="var(--scene-trace)" strokeWidth="4" />
        <circle cy="-30" r="81" fill="var(--scene-shadow)" />
        <circle cy="-30" r="72" fill="url(#sculpture-disc)" />
        {[32, 36, 40, 44, 48, 52, 56, 60, 64].map((r) => <circle key={r} cy="-30" r={r} fill="none" stroke="var(--scene-metal)" strokeWidth=".8" />)}
        <circle cy="-30" r="23" fill="var(--scene-shell)" stroke="var(--scene-trace)" strokeWidth="2" />
        <circle cy="-30" r="154" fill="none" stroke="var(--scene-glyph)" strokeWidth="9" strokeDasharray="173 42 102 51 226 64 199 110" transform="rotate(-29 0 -30)" />
        <rect x="-106" y="147" width="69" height="48" rx="2" fill="var(--scene-glass)" />
        <g stroke="var(--scene-shell)" strokeWidth="3"><path d="M-112 156h-7M-112 165h-7M-112 174h-7M-112 183h-7M-31 156h7M-31 165h7M-31 174h7M-31 183h7" /></g>
        <rect x="89" y="142" width="30" height="64" rx="2" fill="var(--scene-accent)" />
        <path d="M94 144h20M94 203h20" stroke="var(--scene-shell)" strokeWidth="5" />
        <path d="M21 158v53" stroke="var(--scene-glyph)" strokeWidth="10" strokeLinecap="round" />
        {[[-143, -222], [132, -222], [-143, 208], [132, 208]].map(([x, y]) => <g key={`${x},${y}`} transform={`translate(${x} ${y})`}><circle r="6" fill="var(--scene-metal)" /><path d="m-3-3 6 6m-6 0 6-6" stroke="var(--scene-shadow)" /></g>)}
        <circle cx="126" cy="-200" r="5" fill="var(--scene-accent)" />
      </g>
    </svg>
  );
}
