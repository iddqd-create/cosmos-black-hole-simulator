/**
 * CosmosBlackHole - 3D Relativistic Black Hole & Spacetime Curvature Renderer
 * Built with Three.js. Features Schwarzschild event horizon, photon sphere (1.5 rs),
 * warped relativistic accretion disk with Doppler beaming, and deformable spacetime grid.
 */

import * as THREE from 'three';

export class BlackHoleVisualizer {
  constructor(containerElement) {
    this.container = containerElement;
    this.width = this.container.clientWidth || 600;
    this.height = this.container.clientHeight || 500;

    // Mass mode for display: 'stellar' (10 M_sun), 'pbh' (10^12 kg), 'smbh' (4e6 M_sun)
    this.currentMassMode = 'stellar';
    this.customMassKg = 10 * 1.98847e30; // default 10 M_sun

    this.initScene();
    this.createBlackHoleObjects();
    this.createSpacetimeGrid();
    this.setupInteraction();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050711, 0.015);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 8, 24);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x223355, 0.6);
    this.scene.add(ambientLight);

    // Deep space background stars
    this.createBackgroundStars();

    // Window resize observer
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);
  }

  createBackgroundStars() {
    const starCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 60 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const colorVariance = Math.random();
      if (colorVariance > 0.8) {
        colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0; // Blue star
      } else if (colorVariance > 0.6) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.4; // Amber star
      } else {
        colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0; // White star
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  createBlackHoleObjects() {
    this.bhGroup = new THREE.Group();
    this.scene.add(this.bhGroup);

    // 1. Event Horizon (Schwarzschild Sphere r_s)
    // Absolute pure black with zero specularity
    const horizonGeo = new THREE.SphereGeometry(2.0, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    this.bhGroup.add(this.horizonMesh);

    // 2. Photon Sphere Halo (1.5 * r_s = 3.0)
    // Glowing thin Einstein ring with refractive/lensing glow
    const photonSphereGeo = new THREE.SphereGeometry(3.0, 64, 64);
    const photonSphereMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xff8822) },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float rim = 1.0 - abs(dot(viewDir, vNormal));
          float intensity = pow(rim, 4.0) * 1.8;
          gl_FragColor = vec4(glowColor, intensity * 0.7);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.photonSphereMesh = new THREE.Mesh(photonSphereGeo, photonSphereMat);
    this.bhGroup.add(this.photonSphereMesh);

    // 3. Relativistic Accretion Disk (Particles & Swirling Ring)
    this.createAccretionDisk();

    // 4. Lensed Gravitational Shadow Arcs (Top and Bottom Interstellar-style warped disk)
    this.createLensedWarpArcs();

    // 5. Hawking Radiation Glow for PBHs (activated in PBH mode)
    const hawkingGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const hawkingMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.hawkingMesh = new THREE.Mesh(hawkingGeo, hawkingMat);
    this.bhGroup.add(this.hawkingMesh);
  }

  createAccretionDisk() {
    this.diskGroup = new THREE.Group();
    this.bhGroup.add(this.diskGroup);

    // Generate high-density accretion disk particle system
    const particleCount = 20000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    this.diskAngles = new Float32Array(particleCount);
    this.diskRadii = new Float32Array(particleCount);
    this.diskSpeeds = new Float32Array(particleCount);

    const rMin = 3.6;  // ISCO ~ 1.8 * rs
    const rMax = 12.0;

    for (let i = 0; i < particleCount; i++) {
      // Power law density towards inner edge
      const u = Math.random();
      const r = rMin + Math.pow(u, 1.8) * (rMax - rMin);
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.35 * (r / rMin);

      positions[i * 3] = r * Math.cos(angle);
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = r * Math.sin(angle);

      this.diskRadii[i] = r;
      this.diskAngles[i] = angle;
      // Keplerian velocity: v ~ 1 / sqrt(r)
      this.diskSpeeds[i] = 1.2 / Math.sqrt(r);

      // Temperature / Doppler gradient: inner edge is white-hot, outer edge is deep orange/red
      const tempFactor = 1.0 - (r - rMin) / (rMax - rMin);
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.2 + tempFactor * 0.75;
      colors[i * 3 + 2] = 0.05 + tempFactor * 0.95;
      sizes[i] = 1.2 + Math.random() * 2.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleTexture = this.createParticleTexture();

    this.diskMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.diskPoints = new THREE.Points(geometry, this.diskMaterial);
    this.diskGroup.add(this.diskPoints);
  }

  createLensedWarpArcs() {
    // Gravitational lensing bends rays passing over the pole, creating the iconic halo arcs
    const arcRadius = 4.8;
    const arcTube = 0.35;
    const torusGeo = new THREE.TorusGeometry(arcRadius, arcTube, 16, 100, Math.PI);

    const arcMat = new THREE.MeshBasicMaterial({
      color: 0xff7711,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    // Top vertical arc
    this.topArc = new THREE.Mesh(torusGeo, arcMat);
    this.topArc.rotation.x = Math.PI / 2.2;
    this.topArc.rotation.y = 0;
    this.bhGroup.add(this.topArc);

    // Bottom vertical arc
    this.bottomArc = new THREE.Mesh(torusGeo, arcMat.clone());
    this.bottomArc.rotation.x = -Math.PI / 2.2;
    this.bhGroup.add(this.bottomArc);
  }

  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,200,100,0.8)');
    grad.addColorStop(0.8, 'rgba(255,80,0,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  createSpacetimeGrid() {
    // A polar/cartesian spacetime curvature grid (Einstein's gravitational funnel)
    const size = 30;
    const divisions = 40;
    const gridGeo = new THREE.PlaneGeometry(size, size, divisions, divisions);
    gridGeo.rotateX(-Math.PI / 2);

    // Displace vertices downward to show spacetime curvature (Schwarzhild embedding diagram)
    this.gridInitialY = new Float32Array(gridGeo.attributes.position.count);
    const pos = gridGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.sqrt(x * x + z * z);
      // Flamm's paraboloid: z(r) ~ 2 * sqrt(r_s * (r - r_s))
      let depth = 0;
      if (r > 1.8) {
        depth = -4.5 / Math.pow(r, 0.75);
      } else {
        depth = -6.0;
      }
      pos.setY(i, depth);
      this.gridInitialY[i] = depth;
    }
    gridGeo.computeVertexNormals();

    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });

    this.gridMesh = new THREE.Mesh(gridGeo, gridMat);
    this.gridMesh.position.y = -2.5;
    this.scene.add(this.gridMesh);
  }

  setupInteraction() {
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0.002 };

    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;

      this.bhGroup.rotation.y += dx * 0.006;
      this.bhGroup.rotation.x = Math.max(-1.2, Math.min(1.2, this.bhGroup.rotation.x + dy * 0.006));
      this.gridMesh.rotation.y = this.bhGroup.rotation.y;

      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomSpeed = 0.02;
      this.camera.position.z = Math.max(8, Math.min(50, this.camera.position.z + e.deltaY * zoomSpeed));
    }, { passive: false });
  }

  updatePhysics(universeData) {
    const { scalings, blackHoleFunctions, constants } = universeData;
    const { calcRs, calcRph, calcHawkingTemp, calcHawkingLifetime } = blackHoleFunctions;

    // Mass in kg depending on mode
    let targetMass = 10 * 1.98847e30; // 10 M_sun default
    if (this.currentMassMode === 'pbh') {
      targetMass = 1e12; // 10^12 kg micro-PBH
    } else if (this.currentMassMode === 'smbh') {
      targetMass = 4.15e6 * 1.98847e30; // Sagittarius A*
    }
    this.customMassKg = targetMass;

    // True physical Schwarzschild radius in meters
    const rs_meters = calcRs(targetMass);
    const rph_meters = calcRph(targetMass);
    const T_H_kelvin = calcHawkingTemp(targetMass);
    const tau_years = calcHawkingLifetime(targetMass);

    // Relative visual scaling factor
    // Base 3D model has r_s = 2.0 units
    const relativeRs = scalings.rG / (scalings.rc * scalings.rc);
    const visualScale = Math.max(0.35, Math.min(3.5, Math.pow(relativeRs, 0.4)));

    // Scale horizon and photon sphere smoothly
    this.horizonMesh.scale.set(visualScale, visualScale, visualScale);
    this.photonSphereMesh.scale.set(visualScale, visualScale, visualScale);

    // Update spacetime funnel curvature
    const pos = this.gridMesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const baseDepth = this.gridInitialY[i];
      pos.setY(i, baseDepth * Math.pow(scalings.rG, 0.5));
    }
    pos.needsUpdate = true;

    // If PBH mode, show intense Hawking blue/violet radiation flare!
    if (this.currentMassMode === 'pbh') {
      this.hawkingMesh.material.opacity = Math.min(0.85, 0.3 + (T_H_kelvin > 1e10 ? 0.5 : 0.2));
      this.hawkingMesh.scale.set(visualScale * 1.25, visualScale * 1.25, visualScale * 1.25);
      this.diskGroup.visible = false;
      this.topArc.visible = false;
      this.bottomArc.visible = false;
    } else {
      this.hawkingMesh.material.opacity = 0.0;
      this.diskGroup.visible = true;
      this.topArc.visible = true;
      this.bottomArc.visible = true;
      this.diskGroup.scale.set(visualScale, visualScale, visualScale);
      this.topArc.scale.set(visualScale, visualScale, visualScale);
      this.bottomArc.scale.set(visualScale, visualScale, visualScale);
    }

    return {
      massKg: targetMass,
      rs_meters,
      rph_meters,
      T_H_kelvin,
      tau_years
    };
  }

  setMassMode(mode) {
    this.currentMassMode = mode;
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Continuous auto-rotation when idle
    if (!this.isDragging) {
      this.bhGroup.rotation.y += 0.0015;
      this.gridMesh.rotation.y = this.bhGroup.rotation.y;
    }

    // Swirl accretion disk particles with Keplerian differential speeds & Doppler beaming
    if (this.diskPoints && this.diskPoints.geometry) {
      const positions = this.diskPoints.geometry.attributes.position.array;
      const colors = this.diskPoints.geometry.attributes.color.array;
      const count = this.diskAngles.length;

      for (let i = 0; i < count; i++) {
        this.diskAngles[i] += this.diskSpeeds[i] * 0.02;
        const r = this.diskRadii[i];
        const angle = this.diskAngles[i];

        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);

        positions[i * 3] = x;
        positions[i * 3 + 2] = z;

        // Relativistic Doppler beaming:
        // Particles moving towards the camera (negative z or x depending on angle) are boosted in brightness & blue
        const velocityVectorX = -Math.sin(angle);
        const dopplerBoost = 1.0 + velocityVectorX * 0.45;

        const tempFactor = 1.0 - (r - 3.6) / 8.4;
        colors[i * 3] = Math.min(1.5, (1.0) * dopplerBoost);
        colors[i * 3 + 1] = Math.min(1.5, (0.2 + tempFactor * 0.75) * dopplerBoost);
        colors[i * 3 + 2] = Math.min(1.5, (0.05 + tempFactor * 0.95) * dopplerBoost);
      }

      this.diskPoints.geometry.attributes.position.needsUpdate = true;
      this.diskPoints.geometry.attributes.color.needsUpdate = true;
    }

    // Slowly rotate background stars for cosmic depth
    if (this.stars) {
      this.stars.rotation.y += 0.0002;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
