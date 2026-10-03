import * as THREE from 'three';
import { InteractiveObjectId, EsportsGameId } from '../types';
import { soundscape } from '../utils/audio';
import { Esports3DCharacter } from './esportsCharacter';
import {
  createOakPlanksTexture,
  createBookshelfTexture,
  createStoneBricksTexture,
  createBurgundyWoolTexture,
  createCraftingTableTopTexture,
  createFurnaceFrontTexture,
  createChestFrontTexture,
  createPaintingTexture,
  createEsportsPosterTexture,
} from './minecraftTextures';

export interface SceneCallbacks {
  onHoverObject: (id: InteractiveObjectId | null, position2D?: { x: number; y: number }) => void;
  onSelectObject: (id: InteractiveObjectId) => void;
  onControllerDragStart: () => void;
  onControllerDragEnd: () => void;
  onChairDragStart: () => void;
  onChairDragEnd: () => void;
  onMouseDragStart?: () => void;
  onMouseDragEnd?: () => void;
  onMouseDrag?: (normX: number, normY: number) => void;
  onMonitorPowerToggle: (isPowered: boolean) => void;
  onPCPowerToggle: (isPowered: boolean) => void;
  onCharacterInspect?: () => void;
}

type ThemeColorRole = 'accent' | 'highlight' | 'tertiary' | 'surface';

interface ScenePalette {
  accent: string;
  highlight: string;
  tertiary: string;
  surface: string;
}

export class Evoke3DExperience {
  private container: HTMLElement;
  private callbacks: SceneCallbacks;

  // Three.js core
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;
  private removeEventListeners: (() => void) | null = null;
  private devPerfObserver: PerformanceObserver | null = null;
  private devPerfEnabled = false;
  private devPerfWindowStart = 0;
  private devPerfFrameCount = 0;
  private devPerfFrameTotalMs = 0;
  private devPerfFrameMaxMs = 0;
  private devPerfUpdateTotalMs = 0;
  private devPerfUpdateMaxMs = 0;
  private devPerfRenderTotalMs = 0;
  private devPerfRenderMaxMs = 0;
  private devPerfHoverTotalMs = 0;
  private devPerfHoverMaxMs = 0;
  private devPerfHoverCount = 0;
  private devPerfPointerMoveCount = 0;
  private devPerfRawPointerEventCount = 0;
  private devPerfPointerMoveTotalMs = 0;
  private devPerfPointerMoveMaxMs = 0;
  private devSceneInitMs = 0;
  private devPerfLongTaskCount = 0;
  private devPerfLongTaskMaxMs = 0;
  private devPerfSpikes: number[] = [];
  private devPerfFunctions: Record<string, { totalMs: number; maxMs: number; calls: number }> = {};
  private isDestroyed = false;

  // Dual Scene Roots: 3D Character on Left, Battlestation on Right
  public battlestationGroup!: THREE.Group;
  public character!: Esports3DCharacter;
  public activePlayerTag: string = 'EVOKE // APEX';

  // Scroll Progress (0 to 1)
  private scrollProgress = 0;
  private isPortraitViewport = false;

  // Camera Orbit State (Wide panoramic framing for Character on Left + Setup on Right)
  private targetSpherical = { radius: 3.9, phi: 1.22, theta: 0.16 };
  private currentSpherical = { radius: 3.9, phi: 1.22, theta: 0.16 };
  private targetLookAt = new THREE.Vector3(0, 0.95, 0);
  private currentLookAt = new THREE.Vector3(0, 0.95, 0);

  private isPointerDown = false;
  private pointerStart = { x: 0, y: 0 };
  private sphericalStart = { phi: 1.22, theta: 0.38 };
  private isUserOrbited = false;
  private mouseParallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // Mode: normal orbit, monitor zoom, or reveal
  public mode: 'orbit' | 'monitor' | 'reveal' = 'orbit';

  // Raycasting & Interaction
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(0, 0);
  private dragIntersection = new THREE.Vector3();
  private raycastHits: THREE.Intersection[] = [];
  private pendingPointerMove = { x: 0, y: 0, isTouch: false };
  private hasPendingPointerMove = false;
  private flushPendingPointerMove: (() => void) | null = null;
  private hoverClientX = 0;
  private hoverClientY = 0;
  private lastHoverPointerX = Number.NaN;
  private lastHoverPointerY = Number.NaN;
  private interactiveMeshes: Map<THREE.Object3D, InteractiveObjectId> = new Map();
  private interactiveMeshList: THREE.Object3D[] = [];
  private lastMonitorDrawTime = 0;
  private hoveredId: InteractiveObjectId | null = null;
  private themePalette: ScenePalette = {
    accent: '#A62B5F',
    highlight: '#E66A3A',
    tertiary: '#3A102C',
    surface: '#171519',
  };
  private themeMaterials: Array<{
    material: THREE.MeshStandardMaterial;
    role: ThemeColorRole;
    emissive?: boolean;
  }> = [];
  private bookshelfMaterial!: THREE.MeshStandardMaterial;
  private chairUpholsteryMaterial!: THREE.MeshStandardMaterial;
  private deskPadMaterial!: THREE.MeshStandardMaterial;
  private rugMaterial!: THREE.MeshStandardMaterial;
  private paintingMaterial!: THREE.MeshBasicMaterial;
  private posterMaterial!: THREE.MeshBasicMaterial;

  // ----------------------------------------------------
  // CONTROLLER DRAGGING (3D physical dragging & placing)
  // ----------------------------------------------------
  public isDraggingController = false;
  private controllerGroup!: THREE.Group;
  private controllerRestPos = new THREE.Vector3(-0.35, 0.89, 0.32);
  private controllerRestRot = new THREE.Euler(-0.08, 0.28, 0.05);
  private controllerDragPos = new THREE.Vector3();
  private controllerVelocity = new THREE.Vector3();
  private deskDragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.89);

  // ----------------------------------------------------
  // CHAIR DRAGGING, 360° SPIN & INERTIA
  // ----------------------------------------------------
  public isDraggingChair = false;
  private chairRoot!: THREE.Group;
  private chairSeatGroup!: THREE.Group;
  private chairPos = new THREE.Vector3(0, 0, 0.72);
  private chairTargetPos = new THREE.Vector3(0, 0, 0.72);
  private chairVelocity = new THREE.Vector3(0, 0, 0);
  private chairFloorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private chairDragOffset = new THREE.Vector3();
  private chairSwivelAngle = 0; // 0 faces directly towards the desk
  private chairTargetSwivel = 0;
  private chairSpinVelocity = 0;
  private chairDragStartCoord = { x: 0, y: 0 };
  private chairDragStartSwivel = 0;

  // ----------------------------------------------------
  // MOUSE DRAGGING & LIVE MONITOR CURSOR
  // ----------------------------------------------------
  public isDraggingMouse = false;
  public clickedObjectId: InteractiveObjectId | null = null;
  private mouseGroup!: THREE.Group;
  private mouseMesh!: THREE.Mesh;
  public monitorCursorX = 512;
  public monitorCursorY = 256;

  // ----------------------------------------------------
  // HEADSET & SONIC PULSE
  // ----------------------------------------------------
  private headsetGroup!: THREE.Group;
  private sonicRings: THREE.Mesh[] = [];
  private sonicRingDelays = new Float32Array(3);
  private headsetWobble = 0;

  // ----------------------------------------------------
  // PLAYSTATION 5 CONSOLE & ON/OFF STATE
  // ----------------------------------------------------
  public isPCPowered = true;
  private ps5Group!: THREE.Group;
  private ps5LightMesh1!: THREE.Mesh;
  private ps5LightMesh2!: THREE.Mesh;
  private ps5GlowLight!: THREE.PointLight;
  private ps5PowerLedMesh!: THREE.Mesh;

  // ----------------------------------------------------
  // MONITOR & PHYSICAL POWER BUTTON
  // ----------------------------------------------------
  public isMonitorPowered = true;
  private monitorScreenMesh!: THREE.Mesh;
  private monitorCanvas!: HTMLCanvasElement;
  private monitorCtx!: CanvasRenderingContext2D;
  private monitorTexture!: THREE.CanvasTexture;
  private monitorCursorCanvas!: HTMLCanvasElement;
  private monitorCursorCtx!: CanvasRenderingContext2D;
  private monitorCursorTexture!: THREE.CanvasTexture;
  private monitorCursorMesh!: THREE.Mesh;
  private monitorCursorDirty = true;
  private monitorBootProgress = 1.0;
  private monitorStandbyLedMesh!: THREE.Mesh;
  private monitorStandbyLight!: THREE.PointLight;
  private monitorBiasLight!: THREE.PointLight;

  // ----------------------------------------------------
  // KEYBOARD REACTIVE WAVE
  // ----------------------------------------------------
  private keyboardKeyGroup!: THREE.Group;
  private keyboardWaveTime = 0;
  private isKeyboardHovered = false;
  private keyboardWaveColor: string | null = null;

  // ----------------------------------------------------
  // ATMOSPHERIC PARTICLES & LIGHTING
  // ----------------------------------------------------
  private dustParticles!: THREE.Points;
  private ambientLight!: THREE.AmbientLight;
  private mauveSpotLight!: THREE.SpotLight;
  private plumFillLight!: THREE.PointLight;
  private rimLight!: THREE.DirectionalLight;

  // ----------------------------------------------------
  // ENCLOSED ROOM INTERACTION & MINECRAFT PUPPY
  // ----------------------------------------------------
  public isDoorOpen = false;
  private doorSlabGroup!: THREE.Group;

  private bedMattressMesh!: THREE.Mesh;
  private bedBounceTime = 0;

  public isChestOpen = false;
  private chestLidGroup!: THREE.Group;

  // Free-Roaming Minecraft Puppy
  private puppyGroup!: THREE.Group;
  private puppyHeadGroup!: THREE.Group;
  private puppyLegs: THREE.Mesh[] = [];
  private puppyTail!: THREE.Mesh;
  private puppyPos = new THREE.Vector3(0.5, 0, 2.2);
  private puppyTargetPos = new THREE.Vector3(-1.8, 0, 1.0);
  private puppyState: 'walking' | 'idle' | 'sitting' | 'petted' = 'idle';
  private puppyTimer = 2.0;
  private puppyHeading = 0;
  private puppyPetTimer = 0;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.devPerfEnabled = import.meta.env.DEV && new URLSearchParams(window.location.search).get('evokePerf') === '1';
    const sceneInitStartedAt = this.devPerfEnabled ? performance.now() : 0;
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.isPortraitViewport = aspect < 0.85;
    const initialFov = this.isPortraitViewport ? 60 : container.clientWidth < 768 || aspect < 1.0 ? 54 : 44;
    if (this.isPortraitViewport) {
      this.currentSpherical.radius = 5.2;
      this.targetSpherical.radius = 5.2;
      this.currentLookAt.set(1.22, 2.1, 0);
      this.targetLookAt.copy(this.currentLookAt);
    }
    this.camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 40);
    this.updateCameraPosition();

    // Renderer (Alpha enabled for seamless fixed background video integration)
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      precision: 'highp',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // Build Environment & Objects: Character on Left, Battlestation on Right
    this.initLights();
    this.initRoom();
    this.initMoreMinecraftItems();
    this.initPuppy();
    this.initBattlestation();
    this.initCharacter();
    this.initDesk();
    this.initMonitor();
    this.initController();
    this.initChair();
    this.initHeadset();
    this.initPC();
    this.initKeyboardAndMouse();
    this.initAtmosphere();

    if (this.devPerfEnabled) {
      this.devPerfWindowStart = performance.now();
      if (typeof PerformanceObserver !== 'undefined') {
        try {
          this.devPerfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              this.devPerfLongTaskCount += 1;
              this.devPerfLongTaskMaxMs = Math.max(this.devPerfLongTaskMaxMs, entry.duration);
            }
          });
          this.devPerfObserver.observe({ entryTypes: ['longtask'] });
        } catch {
          this.devPerfObserver = null;
        }
      }
    }

    // Bind Interaction Events
    this.bindEvents();
    if (this.devPerfEnabled) this.devSceneInitMs = performance.now() - sceneInitStartedAt;

    // Start loop
    this.animate();
  }

  // ========================================================
  // BATTLESTATION PARENT & 3D CHARACTER ON LEFT
  // ========================================================
  private initBattlestation() {
    this.battlestationGroup = new THREE.Group();
    // Push the entire battlestation setup to the right side of the screen
    this.battlestationGroup.position.set(1.22, 0, -0.05);
    this.scene.add(this.battlestationGroup);
  }

  private initCharacter() {
    // 3D Realistic Character on the left side
    this.character = new Esports3DCharacter(this.scene, new THREE.Vector3(-1.42, 0, 0.12));
    if (this.isPortraitViewport) {
      this.character.setWorldPosition(new THREE.Vector3(1.22, 2.3, 0.12));
    }
    this.character.interactiveMeshes.forEach((mesh) => {
      this.registerInteractive(mesh, 'character_hero');
    });
  }

  // ========================================================
  // LIGHTING SETUP (Plum, Mauve, Charcoal, Burnt Orange)
  // ========================================================
  private initLights() {
    // 1. Deep Plum Ambient Wash
    this.ambientLight = new THREE.AmbientLight(0x252a33, 0.72);
    this.scene.add(this.ambientLight);

    // 2. Main Dramatic Mauve Spotlight focused on the battlestation on the right
    this.mauveSpotLight = new THREE.SpotLight(0xa62b5f, 3.8);
    this.mauveSpotLight.position.set(0.2, 3.4, 1.8);
    this.mauveSpotLight.target.position.set(1.22, 0.85, 0);
    this.mauveSpotLight.angle = Math.PI / 3.8;
    this.mauveSpotLight.penumbra = 0.8;
    this.mauveSpotLight.decay = 2;
    this.mauveSpotLight.castShadow = true;
    this.mauveSpotLight.shadow.mapSize.set(512, 512);
    this.mauveSpotLight.shadow.bias = -0.0005;
    this.scene.add(this.mauveSpotLight);
    this.scene.add(this.mauveSpotLight.target);

    // 3. Crisp Rim Light for Chair, Monitor & Desk edge specular glints
    this.rimLight = new THREE.DirectionalLight(0xf4f0ea, 0.62);
    this.rimLight.position.set(3.4, 3.2, 1.8);
    this.scene.add(this.rimLight);

    // 4. Burnt Orange Hardware Specular Accent Light
    const hardwareKeyLight = new THREE.DirectionalLight(0xe66a3a, 0.58);
    hardwareKeyLight.position.set(-2.5, 2.4, -0.6);
    this.scene.add(hardwareKeyLight);

    // 5. Plum Floor & Shadow Filler
    this.plumFillLight = new THREE.PointLight(0x252a33, 1.35, 7);
    this.plumFillLight.position.set(0, 0.4, 0);
    this.scene.add(this.plumFillLight);

    // 6. Monitor Ambient Bias Light (casts mauve glow behind screen)
    this.monitorBiasLight = new THREE.PointLight(0xa62b5f, 1.75, 4.0);
    this.monitorBiasLight.position.set(0, 1.25, -0.45);
    this.scene.add(this.monitorBiasLight);

    // 7. Burnt Orange Accent LED pin-point
    const accentLed = new THREE.PointLight(0xe66a3a, 0.8, 2.0);
    accentLed.position.set(0.68, 0.98, -0.1);
    this.scene.add(accentLed);
  }

  // ========================================================
  // MINECRAFT ROOM & ARCHITECTURE (Oak Planks & Bookshelves)
  // ========================================================
  private initRoom() {
    // 1. Floor: Minecraft Oak Planks Wood Floor
    const oakFloorTex = createOakPlanksTexture(10, 8);
    const floorGeo = new THREE.PlaneGeometry(13.5, 11.5);
    const floorMat = new THREE.MeshStandardMaterial({
      map: oakFloorTex,
      roughness: 0.65,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0.8);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Wool Rug under the gaming setup area
    const rugTex = createBurgundyWoolTexture();
    const rugGeo = new THREE.PlaneGeometry(5.2, 4.2);
    const rugMat = new THREE.MeshStandardMaterial({
      map: rugTex,
      roughness: 0.88,
    });
    this.rugMaterial = rugMat;
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.6, 0.005, 0.5);
    rug.receiveShadow = true;
    this.scene.add(rug);

    // Stone Bricks Material for Wall Enclosure
    const stoneTex = createStoneBricksTexture(8, 4);
    const wallMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.7,
      metalness: 0.2,
    });

    const oakLogMat = new THREE.MeshStandardMaterial({ color: 0x362215, roughness: 0.8 });

    // 2. Rear Wall (z = -3.2)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 4.8), wallMat);
    backWall.position.set(0, 2.4, -3.2);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // 3. Left Wall (x = -6.2)
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 4.8), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-6.2, 2.4, 0.8);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // 4. Right Wall (x = +6.2)
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 4.8), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(6.2, 2.4, 0.8);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // 5. Solid Front Wall with Zero-Gap Doorway Opening (z = +5.2)
    const leftFrontWall = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 4.8), wallMat);
    leftFrontWall.rotation.y = Math.PI;
    leftFrontWall.position.set(-3.65, 2.4, 5.2);
    leftFrontWall.receiveShadow = true;

    const rightFrontWall = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 4.8), wallMat);
    rightFrontWall.rotation.y = Math.PI;
    rightFrontWall.position.set(3.65, 2.4, 5.2);
    rightFrontWall.receiveShadow = true;

    const topFrontHeader = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.6), wallMat);
    topFrontHeader.rotation.y = Math.PI;
    topFrontHeader.position.set(0, 3.5, 5.2);
    topFrontHeader.receiveShadow = true;

    this.scene.add(leftFrontWall, rightFrontWall, topFrontHeader);

    // 6. Corner Oak Log Pillars (All 4 Room Corners)
    const cornerCoords = [
      [-6.2, -3.2],
      [6.2, -3.2],
      [-6.2, 5.2],
      [6.2, 5.2],
    ];
    cornerCoords.forEach(([cx, cz]) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.8, 0.5), oakLogMat);
      pillar.position.set(cx, 2.4, cz);
      pillar.castShadow = true;
      this.scene.add(pillar);
    });

    // 7. Ceiling Beams (Exposed Dark Oak Timber Beams)
    for (const z of [-1.5, 0.8, 3.1]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.25, 0.35), oakLogMat);
      beam.position.set(0, 4.55, z);
      this.scene.add(beam);
    }

    // 8. Minecraft Enchanting Bookshelf Wall Stacks along the Back Wall
    const shelfTex = createBookshelfTexture();
    const shelfMat = new THREE.MeshStandardMaterial({
      map: shelfTex,
      roughness: 0.6,
      metalness: 0.1,
    });
    this.bookshelfMaterial = shelfMat;

    for (let x = -5.8; x <= 5.8; x += 0.9) {
      // Leave space behind monitor (x: 0.2 to 2.2)
      if (x >= 0.1 && x <= 2.3) continue;
      for (let y = 0; y < 3; y++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), shelfMat);
        shelf.position.set(x, 0.425 + y * 0.85, -2.8);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        this.scene.add(shelf);
      }
    }

    // 9. Redstone Wall Torches
    const torchWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });
    const torchGlowMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

    const torchPositions = [
      [-3.2, 2.4, -3.1],
      [3.8, 2.4, -3.1],
      [-6.1, 2.4, -0.5],
      [6.1, 2.4, -0.5],
    ];

    torchPositions.forEach(([tx, ty, tz]) => {
      const torchStick = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.04), torchWoodMat);
      torchStick.position.set(tx, ty, tz);
      const torchHead = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), torchGlowMat);
      torchHead.position.set(tx, ty + 0.12, tz);
      const torchLight = new THREE.PointLight(0xff5533, 0.9, 4.5);
      torchLight.position.set(tx, ty + 0.14, tz + 0.1);
      this.scene.add(torchStick, torchHead, torchLight);
      
      this.registerInteractive(torchStick, 'lights');
      this.registerInteractive(torchHead, 'lights');
    });

    // Build Bed and Door
    this.initMinecraftBedAndDoor();
  }

  private initMinecraftBedAndDoor() {
    // ========================================================
    // MINECRAFT DOOR (LOCATED ON THE FRONT ENCLOSURE WALL)
    // ========================================================
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, 5.15);
    doorGroup.rotation.y = Math.PI;

    const frameMatDoor = new THREE.MeshStandardMaterial({ color: 0x362215, roughness: 0.8 });
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x221720, roughness: 0.65 });
    const doorAccentMat = new THREE.MeshStandardMaterial({
      color: 0xa62b5f,
      emissive: 0x3a102c,
      emissiveIntensity: 0.25,
      roughness: 0.45,
      metalness: 0.35,
    });
    const doorHighlightMat = new THREE.MeshStandardMaterial({ color: 0xe66a3a, metalness: 0.65 });

    // Outer Door Frame
    for (const x of [-0.48, 0.48]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.16, 0.18), frameMatDoor);
      post.position.set(x, 1.08, 0);
      doorGroup.add(post);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.14, 0.18), frameMatDoor);
    lintel.position.set(0, 2.15, 0);
    doorGroup.add(lintel);

    // Interactive Swiveling Door Slab Group (pivots on left hinge!)
    this.doorSlabGroup = new THREE.Group();
    this.doorSlabGroup.position.set(-0.42, 0, 0);

    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.95, 0.08), panelMat);
    slab.position.set(0.41, 0.98, 0);
    this.doorSlabGroup.add(slab);

    for (const y of [0.52, 1.38]) {
      const inset = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.025), doorAccentMat);
      inset.position.set(0.41, y, 0.045);
      this.doorSlabGroup.add(inset);
    }
    const window = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.03), doorHighlightMat);
    window.position.set(0.41, 1.74, 0.048);
    this.doorSlabGroup.add(window);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.08), doorHighlightMat);
    handle.position.set(0.72, 0.98, 0.06);
    this.doorSlabGroup.add(handle);

    this.doorSlabGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        this.registerInteractive(obj, 'door');
      }
    });

    doorGroup.add(this.doorSlabGroup);

    // Stone Pressure Plate on floor inside room
    const pressPlateMat = new THREE.MeshStandardMaterial({ color: 0x4a4e54, roughness: 0.6 });
    const pressPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.025, 0.38), pressPlateMat);
    pressPlate.position.set(0, 0.012, -0.35);
    doorGroup.add(pressPlate);

    this.scene.add(doorGroup);

    // ========================================================
    // MINECRAFT BED (ON THE OTHER END OF THE WALL - LEFT SIDE)
    // ========================================================
    const bedGroup = new THREE.Group();
    // Positioned along the left wall, facing inward towards room center!
    bedGroup.position.set(-5.0, 0, 2.2);
    bedGroup.rotation.y = Math.PI / 2;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x362215, roughness: 0.8 });
    const bedspreadMat = new THREE.MeshStandardMaterial({ color: 0xa62b5f, roughness: 0.92 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xf4f0ea, roughness: 0.9 });

    this.bedMattressMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.24, 1.9), bedspreadMat);
    this.bedMattressMesh.position.set(0, 0.36, 0);
    this.bedMattressMesh.castShadow = true;
    this.bedMattressMesh.receiveShadow = true;
    bedGroup.add(this.bedMattressMesh);

    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.18, 1.96), frameMat);
    bedBase.position.set(0, 0.18, 0);
    bedGroup.add(bedBase);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.58, 0.12), frameMat);
    headboard.position.set(0, 0.48, -0.96);
    bedGroup.add(headboard);

    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.36), pillowMat);
    pillow.position.set(0, 0.52, -0.65);
    bedGroup.add(pillow);

    for (const x of [-0.46, 0.46]) {
      for (const z of [-0.88, 0.88]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 0.14), frameMat);
        leg.position.set(x, 0.10, z);
        bedGroup.add(leg);
      }
    }

    bedGroup.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        this.registerInteractive(object, 'bed');
      }
    });
    this.scene.add(bedGroup);
  }

  // ========================================================
  // MORE MINECRAFTY ITEMS (Crafting Table, Furnace, Chest, Painting, Lantern)
  // ========================================================
  private initMoreMinecraftItems() {
    // 1. Crafting Table (On Left Wall next to bed)
    const craftGroup = new THREE.Group();
    craftGroup.position.set(-5.2, 0, -0.8);

    const craftTopTex = createCraftingTableTopTexture();
    const woodSideMat = new THREE.MeshStandardMaterial({ color: 0x8f5c32, roughness: 0.7 });
    const topMat = new THREE.MeshStandardMaterial({ map: craftTopTex, roughness: 0.6 });

    const craftMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.85, 0.85),
      [woodSideMat, woodSideMat, topMat, woodSideMat, woodSideMat, woodSideMat]
    );
    craftMesh.position.set(0, 0.425, 0);
    craftMesh.castShadow = true;
    craftMesh.receiveShadow = true;
    this.registerInteractive(craftMesh, 'crafting_table');
    craftGroup.add(craftMesh);
    this.scene.add(craftGroup);

    // 2. Furnace with Glowing Coal Fire (On Left Wall Corner)
    const furnaceGroup = new THREE.Group();
    furnaceGroup.position.set(-5.2, 0, -2.0);

    const stoneSideMat = new THREE.MeshStandardMaterial({ color: 0x4a4e54, roughness: 0.75 });
    const furnaceFrontTex = createFurnaceFrontTexture();
    const frontMat = new THREE.MeshStandardMaterial({ map: furnaceFrontTex, roughness: 0.7 });

    // Front faces right (+X)
    const furnaceMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.85, 0.85),
      [frontMat, stoneSideMat, stoneSideMat, stoneSideMat, stoneSideMat, stoneSideMat]
    );
    furnaceMesh.position.set(0, 0.425, 0);
    furnaceMesh.castShadow = true;
    furnaceMesh.receiveShadow = true;
    furnaceGroup.add(furnaceMesh);

    // Warm Coal Fire Glow Light
    const furnaceLight = new THREE.PointLight(0xff5500, 1.8, 4.0);
    furnaceLight.position.set(0.45, 0.425, 0);
    furnaceGroup.add(furnaceLight);
    this.scene.add(furnaceGroup);

    // 3. Storage Chest / Ender Chest (On Right Wall)
    const chestGroup = new THREE.Group();
    chestGroup.position.set(5.2, 0, 2.2);

    const chestTex = createChestFrontTexture();
    const chestWoodMat = new THREE.MeshStandardMaterial({ map: chestTex, roughness: 0.6 });
    const ironLockMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 });

    const chestBase = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.85), chestWoodMat);
    chestBase.position.set(0, 0.225, 0);
    chestBase.castShadow = true;
    this.registerInteractive(chestBase, 'chest');
    chestGroup.add(chestBase);

    // Lid group with pivot at rear top edge
    this.chestLidGroup = new THREE.Group();
    this.chestLidGroup.position.set(0, 0.45, -0.425);

    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.25, 0.85), chestWoodMat);
    lidMesh.position.set(0, 0.125, 0.425);
    lidMesh.castShadow = true;
    this.registerInteractive(lidMesh, 'chest');
    this.chestLidGroup.add(lidMesh);

    const lockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.08), ironLockMat);
    lockMesh.position.set(0, 0.08, 0.865);
    this.chestLidGroup.add(lockMesh);

    chestGroup.add(this.chestLidGroup);
    this.scene.add(chestGroup);

    // 4. Minecraft Wall Painting (Right Wall)
    const paintingTex = createPaintingTexture();
    this.paintingMaterial = new THREE.MeshBasicMaterial({ map: paintingTex });
    const paintingMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), this.paintingMaterial);
    paintingMesh.rotation.y = -Math.PI / 2;
    paintingMesh.position.set(6.14, 2.4, -0.5);
    this.scene.add(paintingMesh);

    // 5. Minecraft Jukebox (Right Wall next to chest)
    const jukeboxMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.65 });
    const jukeDiscMat = new THREE.MeshBasicMaterial({ color: 0xa62b5f });
    const jukebox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), jukeboxMat);
    jukebox.position.set(5.2, 0.425, 0.9);
    const discSlot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.08), jukeDiscMat);
    discSlot.position.set(5.2, 0.86, 0.9);
    this.scene.add(jukebox, discSlot);

    // 6. Hanging Redstone/Iron Lantern from Ceiling Beam
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0, 3.4, 0.5);

    const chainMat = new THREE.MeshStandardMaterial({ color: 0x4a4a50, metalness: 0.8 });
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), chainMat);
    chain.position.set(0, 0.2, 0);

    const ironFrameMat = new THREE.MeshStandardMaterial({ color: 0x222226, metalness: 0.8, roughness: 0.3 });
    const glowCoreMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });

    const lanternFrame = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.22), ironFrameMat);
    const lanternCore = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 0.14), glowCoreMat);
    lanternGroup.add(chain, lanternFrame, lanternCore);

    const lanternLight = new THREE.PointLight(0xffaa33, 2.6, 7.0);
    lanternLight.position.set(0, 0, 0);
    lanternGroup.add(lanternLight);

    this.scene.add(lanternGroup);

    // 7. EVOKE ESPORTS CHAMPIONS POSTER (Mounted on Left Wall above bed)
    const posterTex = createEsportsPosterTexture();
    const posterMat = new THREE.MeshBasicMaterial({ map: posterTex });
    this.posterMaterial = posterMat;
    const posterMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.4), posterMat);
    posterMesh.rotation.y = Math.PI / 2;
    posterMesh.position.set(-6.14, 2.6, 2.2);
    this.registerInteractive(posterMesh, 'poster');
    this.scene.add(posterMesh);
  }

  // ========================================================
  // SMALL FREE-ROAMING MINECRAFT TAMED PUPPY
  // ========================================================
  private initPuppy() {
    this.puppyGroup = new THREE.Group();
    this.puppyGroup.position.copy(this.puppyPos);

    const furMat = new THREE.MeshStandardMaterial({ color: 0xede8df, roughness: 0.8 }); // Cream white fur
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 0.75 });
    const noseMat = new THREE.MeshBasicMaterial({ color: 0x1a1715 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xa62b5f, roughness: 0.4 }); // Red collar
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x151419 });
    const eyeGlintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    this.themeMaterials.push({ material: collarMat, role: 'accent' });

    // 1. Puppy Main Body Block
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.42), furMat);
    body.position.set(0, 0.26, 0);
    body.castShadow = true;
    this.puppyGroup.add(body);

    // 2. Red Collar Ring around neck
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.05, 0.10), collarMat);
    collar.position.set(0, 0.28, 0.16); // +0.16 FOR FORWARD HEAD
    this.puppyGroup.add(collar);

    // 3. Puppy Head Group
    this.puppyHeadGroup = new THREE.Group();
    this.puppyHeadGroup.position.set(0, 0.32, 0.22); // +0.22 FOR FORWARD HEAD

    const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), furMat);
    headBox.castShadow = true;
    this.puppyHeadGroup.add(headBox);

    // Snout & Nose
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.12), snoutMat);
    snout.position.set(0, -0.03, 0.15); // FORWARD
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.03), noseMat);
    nose.position.set(0, 0.01, 0.215); // FORWARD NOSE TIP
    this.puppyHeadGroup.add(snout, nose);

    // Floppy/Perky Ears & Eyes
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.05), furMat);
      ear.position.set(side * 0.10, 0.13, 0.02);
      ear.rotation.z = -side * 0.15;
      this.puppyHeadGroup.add(ear);

      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), eyeMat);
      eye.position.set(side * 0.08, 0.02, 0.122);
      const glint = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.022), eyeGlintMat);
      glint.position.set(side * 0.075, 0.028, 0.123);
      this.puppyHeadGroup.add(eye, glint);
    }

    this.puppyGroup.add(this.puppyHeadGroup);

    // 4. 4 Voxel Legs
    this.puppyLegs = [];
    const legCoords = [
      [-0.10, 0.11, 0.14],  // Front Left (+Z Forward)
      [0.10, 0.11, 0.14],   // Front Right (+Z Forward)
      [-0.10, 0.11, -0.14], // Back Left (-Z Rear)
      [0.10, 0.11, -0.14],  // Back Right (-Z Rear)
    ];

    legCoords.forEach(([lx, ly, lz]) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(lx, ly, lz);
      const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), furMat);
      legMesh.position.set(0, -0.11, 0);
      legMesh.castShadow = true;
      legGroup.add(legMesh);
      this.puppyLegs.push(legGroup as unknown as THREE.Mesh);
      this.puppyGroup.add(legGroup);
    });

    // 5. Fluffy Voxel Puppy Tail (At Rear -Z)
    this.puppyTail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.20), furMat);
    this.puppyTail.position.set(0, 0.28, -0.21); // REAR TAIL
    this.puppyTail.rotation.x = -0.35;
    this.puppyGroup.add(this.puppyTail);

    // Register all puppy parts for interactive clicks / petting
    this.puppyGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        this.registerInteractive(obj, 'puppy');
      }
    });

    this.scene.add(this.puppyGroup);
  }

  // ========================================================
  // MINECRAFT OAK PLANKS WORKSTATION DESK
  // ========================================================
  private initDesk() {
    const deskGroup = new THREE.Group();

    // Tabletop: Minecraft Oak Planks Wood Block Slab
    const deskOakTex = createOakPlanksTexture(3, 2);
    const topGeo = new THREE.BoxGeometry(2.1, 0.08, 1.0);
    const topMat = new THREE.MeshStandardMaterial({
      map: deskOakTex,
      roughness: 0.6,
      metalness: 0.15,
    });
    const tabletop = new THREE.Mesh(topGeo, topMat);
    tabletop.position.set(0, 0.84, 0);
    tabletop.castShadow = true;
    tabletop.receiveShadow = true;
    deskGroup.add(tabletop);

    // Sturdy Minecraft Dark Oak Wood Pillar Legs (Voxel blocks)
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x362215, // Dark Oak Log
      roughness: 0.75,
      metalness: 0.1,
    });

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.84, 0.75), legMat);
    leftLeg.position.set(-0.88, 0.42, 0);
    leftLeg.castShadow = true;
    deskGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.84, 0.75), legMat);
    rightLeg.position.set(0.88, 0.42, 0);
    rightLeg.castShadow = true;
    deskGroup.add(rightLeg);

    // Minecraft Burgundy Wool Gaming Desk Pad (Brand Palette)
    const burgundyMatTex = createBurgundyWoolTexture();
    const matGeo = new THREE.BoxGeometry(1.35, 0.01, 0.58);
    const matMat = new THREE.MeshStandardMaterial({
      map: burgundyMatTex,
      roughness: 0.85,
      metalness: 0.1,
    });
    this.deskPadMaterial = matMat;
    const deskMat = new THREE.Mesh(matGeo, matMat);
    deskMat.position.set(0, 0.885, 0.08);
    deskMat.receiveShadow = true;
    deskGroup.add(deskMat);

    // Burnt Orange Trim Border on Desk Pad
    const borderGeo = new THREE.BoxGeometry(1.37, 0.008, 0.60);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xe66a3a,
      roughness: 0.3,
      metalness: 0.8,
    });
    this.themeMaterials.push({ material: borderMat, role: 'highlight' });
    const matBorder = new THREE.Mesh(borderGeo, borderMat);
    matBorder.position.set(0, 0.882, 0.08);
    deskGroup.add(matBorder);

    // Minecraft Wood Inlay Text
    const deskCanvas = document.createElement('canvas');
    deskCanvas.width = 512;
    deskCanvas.height = 128;
    const dCtx = deskCanvas.getContext('2d')!;
    dCtx.imageSmoothingEnabled = false;
    dCtx.clearRect(0, 0, 512, 128);
    dCtx.font = 'bold 24px monospace';
    dCtx.fillStyle = 'rgba(230, 106, 58, 0.7)';
    dCtx.textAlign = 'center';
    dCtx.fillText('✦ EVOKE // VALORANT PROTOCOL ✦', 256, 75);

    const deskTexture = new THREE.CanvasTexture(deskCanvas);
    deskTexture.magFilter = THREE.NearestFilter;
    const engraveGeo = new THREE.PlaneGeometry(0.42, 0.10);
    const engraveMat = new THREE.MeshBasicMaterial({
      map: deskTexture,
      transparent: true,
      opacity: 0.85,
    });
    const engraveMesh = new THREE.Mesh(engraveGeo, engraveMat);
    engraveMesh.rotation.x = -Math.PI / 2;
    engraveMesh.position.set(0, 0.892, 0.3);
    deskGroup.add(engraveMesh);

    // Make desk pad interactive (triggers keyboard wave)
    this.registerInteractive(deskMat, 'keyboard');
    this.battlestationGroup.add(deskGroup);
  }

  // ========================================================
  // ULTRA-WIDE CURVED GAMING MONITOR & PHYSICAL POWER BUTTON
  // ========================================================
  private initMonitor() {
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0, 0.875, -0.18);

    // Monitor Arm / Stand
    const baseGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.02, 32);
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x1f1b22,
      roughness: 0.35,
      metalness: 0.8,
    });
    const standBase = new THREE.Mesh(baseGeo, standMat);
    standBase.position.set(0, 0.01, -0.15);
    monitorGroup.add(standBase);

    const armGeo = new THREE.BoxGeometry(0.04, 0.42, 0.05);
    const standArm = new THREE.Mesh(armGeo, standMat);
    standArm.position.set(0, 0.22, -0.16);
    standArm.rotation.x = 0.08;
    monitorGroup.add(standArm);

    // Monitor Outer Bezel Frame
    const centerBezelGeo = new THREE.BoxGeometry(0.94, 0.46, 0.04);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x171519,
      roughness: 0.4,
      metalness: 0.7,
    });
    const centerBezel = new THREE.Mesh(centerBezelGeo, bezelMat);
    centerBezel.position.set(0, 0.38, 0);
    centerBezel.castShadow = true;
    monitorGroup.add(centerBezel);

    // Lower Chin Bar (for visible controls)
    const chinGeo = new THREE.BoxGeometry(0.94, 0.035, 0.045);
    const chinMat = new THREE.MeshStandardMaterial({
      color: 0x1c1920,
      roughness: 0.3,
      metalness: 0.75,
    });
    const chinMesh = new THREE.Mesh(chinGeo, chinMat);
    chinMesh.position.set(0, 0.165, 0.005);
    monitorGroup.add(chinMesh);

    // ----------------------------------------------------
    // VISIBLE PHYSICAL POWER BUTTON ON LOWER RIGHT BEZEL
    // ----------------------------------------------------
    const pBtnGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.014, 20);
    const pBtnMat = new THREE.MeshStandardMaterial({
      color: 0x2e2532,
      metalness: 0.8,
      roughness: 0.25,
    });
    const powerButtonMesh = new THREE.Mesh(pBtnGeo, pBtnMat);
    powerButtonMesh.rotation.x = Math.PI / 2;
    powerButtonMesh.position.set(0.38, 0.165, 0.026);
    monitorGroup.add(powerButtonMesh);

    // Standby / Active LED Diode next to Power Button
    const ledGeo = new THREE.SphereGeometry(0.004, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xa62b5f });
    this.monitorStandbyLedMesh = new THREE.Mesh(ledGeo, ledMat);
    this.monitorStandbyLedMesh.position.set(0.41, 0.165, 0.027);
    monitorGroup.add(this.monitorStandbyLedMesh);

    this.monitorStandbyLight = new THREE.PointLight(0xa62b5f, 0.8, 0.35);
    this.monitorStandbyLight.position.set(0.41, 0.165, 0.035);
    monitorGroup.add(this.monitorStandbyLight);

    // Dynamic High-Res Screen Texture
    this.monitorCanvas = document.createElement('canvas');
    this.monitorCanvas.width = 1024;
    this.monitorCanvas.height = 512;
    this.monitorCtx = this.monitorCanvas.getContext('2d')!;
    this.monitorTexture = new THREE.CanvasTexture(this.monitorCanvas);
    this.drawMonitorScreen(0);

    const screenGeo = new THREE.PlaneGeometry(0.89, 0.41);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.monitorTexture,
    });
    this.monitorScreenMesh = new THREE.Mesh(screenGeo, screenMat);
    this.monitorScreenMesh.position.set(0, 0.38, 0.021);
    monitorGroup.add(this.monitorScreenMesh);

    // Keep the live cursor on a small overlay texture so dragging does not upload
    // the full 1024x512 monitor canvas on every interaction frame.
    this.monitorCursorCanvas = document.createElement('canvas');
    this.monitorCursorCanvas.width = 256;
    this.monitorCursorCanvas.height = 128;
    this.monitorCursorCtx = this.monitorCursorCanvas.getContext('2d')!;
    this.monitorCursorTexture = new THREE.CanvasTexture(this.monitorCursorCanvas);
    this.monitorCursorTexture.colorSpace = THREE.SRGBColorSpace;
    this.monitorCursorMesh = new THREE.Mesh(
      screenGeo,
      new THREE.MeshBasicMaterial({
        map: this.monitorCursorTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      })
    );
    this.monitorCursorMesh.position.copy(this.monitorScreenMesh.position);
    this.monitorCursorMesh.position.z += 0.001;
    this.monitorCursorMesh.renderOrder = this.monitorScreenMesh.renderOrder + 1;
    monitorGroup.add(this.monitorCursorMesh);
    this.drawMonitorCursor();

    // Register interactions:
    // Clicking power button toggles power state!
    this.registerInteractive(powerButtonMesh, 'monitor_power');
    this.registerInteractive(this.monitorStandbyLedMesh, 'monitor_power');

    // Clicking screen or bezel zooms camera into the display!
    this.registerInteractive(this.monitorScreenMesh, 'monitor');
    this.registerInteractive(centerBezel, 'monitor');
    this.registerInteractive(chinMesh, 'monitor');

    this.battlestationGroup.add(monitorGroup);
  }

  private drawMonitorScreen(time: number) {
    const ctx = this.monitorCtx;
    const w = this.monitorCanvas.width;
    const h = this.monitorCanvas.height;

    if (!this.isMonitorPowered && this.monitorBootProgress <= 0.01) {
      // Screen is completely OFF: Dark Obsidian Screen
      ctx.fillStyle = '#0e0b14';
      ctx.fillRect(0, 0, w, h);

      // Subtle standby text hint
      ctx.fillStyle = 'rgba(166, 43, 95, 0.7)';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('✦ OBSIDIAN DISPLAY [STANDBY] ✦', w - 40, h - 30);

      this.monitorTexture.needsUpdate = true;
      return;
    }

    const bootAlpha = this.monitorBootProgress;

    // Background: Deep Night Sky / Nether Slate
    ctx.fillStyle = '#100c19';
    ctx.fillRect(0, 0, w, h);

    // Subtle Pixel Grid Overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.018)';
    for (let y = 0; y < h; y += 6) {
      ctx.fillRect(0, y, w, 2);
    }

    ctx.save();
    ctx.globalAlpha = bootAlpha;

    // 1. Header Status Bar: Gamer Tag & Telemetry (Burgundy & Burnt Orange)
    ctx.fillStyle = '#A62B5F';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `✦ OPERATOR // ${this.activePlayerTag} • VALORANT RADIANT PROTOCOL • 240 FPS ✦`,
      35,
      45
    );

    // Burnt Orange live indicator
    ctx.fillStyle = '#E66A3A';
    ctx.fillRect(w - 55, 33, 10, 10);

    // 2. Central Creed (Ivory & Burgundy/Burnt Orange)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4f0ea';
    ctx.font = '900 48px monospace';
    ctx.fillText('MORE THAN A GAME.', w / 2, h / 2 - 30);

    ctx.fillStyle = '#E66A3A';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('✦ PLAY.  PROVE.  PROGRESS. ✦', w / 2, h / 2 + 10);

    // 3. Minecraft HUD: Health Hearts, Armor, Hunger & XP Bar
    const hudY = h - 135;
    const hudCenterX = w / 2;

    // A. 10 Golden Armor Shields (Row above hearts)
    for (let i = 0; i < 10; i++) {
      const ax = hudCenterX - 180 + i * 16;
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(ax, hudY - 20, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ax + 2, hudY - 18, 4, 4);
    }

    // B. 10 Red Hearts (Health Bar)
    for (let i = 0; i < 10; i++) {
      const hx = hudCenterX - 180 + i * 16;
      ctx.fillStyle = '#ff2222';
      // Heart pixel shape
      ctx.fillRect(hx, hudY, 12, 10);
      ctx.fillRect(hx + 2, hudY + 10, 8, 4);
      // White highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hx + 2, hudY + 2, 3, 3);
    }

    // C. 10 Hunger Drumsticks (Right side)
    for (let i = 0; i < 10; i++) {
      const dx = hudCenterX + 30 + i * 16;
      ctx.fillStyle = '#9e5a2b';
      ctx.fillRect(dx, hudY, 10, 10);
      ctx.fillStyle = '#dfd8ba';
      ctx.fillRect(dx + 8, hudY + 6, 4, 6);
    }

    // D. Green Experience (XP) Bar
    const xpBarWidth = 360;
    const xpBarX = hudCenterX - xpBarWidth / 2;
    ctx.fillStyle = '#0a2e0a';
    ctx.fillRect(xpBarX, hudY + 22, xpBarWidth, 10);

    // Glowing Lime Green XP Fill
    ctx.fillStyle = '#55ff55';
    ctx.fillRect(xpBarX + 2, hudY + 24, xpBarWidth - 4, 6);

    // XP Level Number "99" in center
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#000000';
    ctx.fillText('99', hudCenterX + 1, hudY + 20);
    ctx.fillStyle = '#55ff55';
    ctx.fillText('99', hudCenterX, hudY + 19);

    // 4. Minecraft 9-Slot Hotbar Inventory
    const slotSize = 36;
    const hotbarWidth = slotSize * 9 + 8;
    const hotbarX = hudCenterX - hotbarWidth / 2;
    const hotbarY = h - 75;

    // Hotbar background
    ctx.fillStyle = '#1e1c24';
    ctx.fillRect(hotbarX, hotbarY, hotbarWidth, slotSize + 8);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(hotbarX, hotbarY, hotbarWidth, slotSize + 8);

    // Individual item slots
    for (let s = 0; s < 9; s++) {
      const sx = hotbarX + 4 + s * slotSize;
      const sy = hotbarY + 4;
      ctx.fillStyle = '#14121a';
      ctx.fillRect(sx, sy, slotSize - 2, slotSize - 2);

      // Draw pixel item icons in each slot
      if (s === 0) {
        // Slot 1: Diamond Sword (Active Selected Slot!)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(sx - 2, sy - 2, slotSize + 2, slotSize + 2);
        ctx.fillStyle = '#55ffff';
        ctx.fillRect(sx + 10, sy + 6, 12, 18);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(sx + 12, sy + 24, 8, 4);
      } else if (s === 1) {
        // Golden Apple
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(sx + 8, sy + 8, 16, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 10, sy + 10, 4, 4);
      } else if (s === 2) {
        // Ender Pearl
        ctx.fillStyle = '#00aaaa';
        ctx.fillRect(sx + 9, sy + 9, 14, 14);
      } else if (s === 3) {
        // Redstone Torch
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(sx + 14, sy + 12, 4, 14);
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(sx + 12, sy + 6, 8, 8);
      } else if (s === 4) {
        // Diamond Pickaxe
        ctx.fillStyle = '#55ffff';
        ctx.fillRect(sx + 6, sy + 6, 20, 6);
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(sx + 14, sy + 12, 4, 14);
      } else if (s === 5) {
        // Cooked Steak
        ctx.fillStyle = '#8f3d17';
        ctx.fillRect(sx + 8, sy + 8, 16, 14);
      } else if (s === 6) {
        // Totem of Undying
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(sx + 10, sy + 6, 12, 18);
        ctx.fillStyle = '#55ff55';
        ctx.fillRect(sx + 12, sy + 10, 8, 4);
      } else if (s === 7) {
        // Healing Potion
        ctx.fillStyle = '#ff33aa';
        ctx.fillRect(sx + 10, sy + 10, 12, 14);
      } else if (s === 8) {
        // Golden Helmet
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(sx + 8, sy + 8, 16, 12);
      }
    }

    ctx.restore();
    this.monitorTexture.needsUpdate = true;
  }

  private drawMonitorCursor() {
    const ctx = this.monitorCursorCtx;
    const scale = this.monitorCursorCanvas.width / 1024;
    const cx = this.monitorCursorX * scale;
    const cy = this.monitorCursorY * scale;
    ctx.clearRect(0, 0, this.monitorCursorCanvas.width, this.monitorCursorCanvas.height);

    if (this.monitorBootProgress > 0.1) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 2.5, cy - 0.5, 5, 1);
      ctx.fillRect(cx - 0.5, cy - 2.5, 1, 5);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.25;
      ctx.strokeRect(cx - 2.75, cy - 0.75, 5.5, 1.5);
      ctx.strokeRect(cx - 0.75, cy - 2.75, 1.5, 5.5);
      ctx.fillStyle = '#55ffff';
      ctx.font = 'bold 3px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `XYZ: [${Math.round(this.monitorCursorX)}, 64, ${Math.round(this.monitorCursorY)}]`,
        cx + 4,
        cy + 4
      );
    }

    this.monitorCursorTexture.needsUpdate = true;
    this.monitorCursorDirty = false;
  }

  // ========================================================
  // PRO ESPORTS CONTROLLER (Physically Draggable in 3D!)
  // ========================================================
  private initController() {
    this.controllerGroup = new THREE.Group();
    this.controllerGroup.position.copy(this.controllerRestPos);
    this.controllerGroup.rotation.copy(this.controllerRestRot);

    // Controller Main Body (Ergonomic sculpt)
    const bodyGeo = new THREE.BoxGeometry(0.18, 0.042, 0.11);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1f1a23,
      roughness: 0.35,
      metalness: 0.6,
    });
    this.themeMaterials.push({ material: bodyMat, role: 'surface' });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    this.controllerGroup.add(body);

    // Left & Right Ergonomic Grips
    const gripGeo = new THREE.CylinderGeometry(0.028, 0.038, 0.12, 16);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x18141b,
      roughness: 0.6,
      metalness: 0.4,
    });
    this.themeMaterials.push({ material: gripMat, role: 'tertiary' });

    const leftGrip = new THREE.Mesh(gripGeo, gripMat);
    leftGrip.position.set(-0.09, -0.015, 0.045);
    leftGrip.rotation.z = 0.28;
    leftGrip.rotation.x = 0.3;
    leftGrip.castShadow = true;
    this.controllerGroup.add(leftGrip);

    const rightGrip = new THREE.Mesh(gripGeo, gripMat);
    rightGrip.position.set(0.09, -0.015, 0.045);
    rightGrip.rotation.z = -0.28;
    rightGrip.rotation.x = 0.3;
    rightGrip.castShadow = true;
    this.controllerGroup.add(rightGrip);

    // Thumbsticks (with Mauve stems & Ivory tops)
    const stickStemGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.018, 12);
    const stickCapGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.006, 16);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xa62b5f, metalness: 0.8 });
    this.themeMaterials.push({ material: stemMat, role: 'accent' });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x171519, roughness: 0.8 });

    // Left Stick
    const leftStickStem = new THREE.Mesh(stickStemGeo, stemMat);
    leftStickStem.position.set(-0.045, 0.028, 0.015);
    const leftStickCap = new THREE.Mesh(stickCapGeo, capMat);
    leftStickCap.position.set(-0.045, 0.037, 0.015);
    this.controllerGroup.add(leftStickStem, leftStickCap);

    // Right Stick
    const rightStickStem = new THREE.Mesh(stickStemGeo, stemMat);
    rightStickStem.position.set(0.035, 0.028, 0.03);
    const rightStickCap = new THREE.Mesh(stickCapGeo, capMat);
    rightStickCap.position.set(0.035, 0.037, 0.03);
    this.controllerGroup.add(rightStickStem, rightStickCap);

    // Center Evoke Guide Button (Burnt Orange core ring)
    const guideGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 16);
    const guideMat = new THREE.MeshStandardMaterial({
      color: 0xe66a3a,
      emissive: 0xe66a3a,
      emissiveIntensity: 0.8,
    });
    this.themeMaterials.push({ material: guideMat, role: 'highlight', emissive: true });
    const guideBtn = new THREE.Mesh(guideGeo, guideMat);
    guideBtn.position.set(0, 0.024, -0.01);
    this.controllerGroup.add(guideBtn);

    // Action Buttons
    const btnGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.005, 12);
    const btnMat = new THREE.MeshStandardMaterial({ color: 0xf4f0ea });
    const btnCoords = [
      [0.065, 0.024, -0.015],
      [0.075, 0.024, -0.005],
      [0.055, 0.024, -0.005],
      [0.065, 0.024, 0.005],
    ];
    btnCoords.forEach(([x, y, z]) => {
      const btn = new THREE.Mesh(btnGeo, btnMat);
      btn.position.set(x, y, z);
      this.controllerGroup.add(btn);
    });

    // Make all parts draggable
    this.registerInteractive(body, 'controller');
    this.registerInteractive(leftGrip, 'controller');
    this.registerInteractive(rightGrip, 'controller');
    this.registerInteractive(guideBtn, 'controller');

    this.battlestationGroup.add(this.controllerGroup);
  }

  // ========================================================
  // MINECRAFT REDSTONE & WOOL VOXEL GAMING CHAIR
  // ========================================================
  private initChair() {
    this.chairRoot = new THREE.Group();
    this.chairRoot.position.copy(this.chairPos);

    // Minecraft Piston Hub Base & Iron Block Spider Feet
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.3,
    });
    const pistonWoodMat = new THREE.MeshStandardMaterial({
      color: 0x7a5127,
      roughness: 0.7,
    });
    this.themeMaterials.push({ material: pistonWoodMat, role: 'tertiary' });

    // Piston Cylinder Core Base
    const baseHub = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.18), pistonWoodMat);
    baseHub.position.set(0, 0.08, 0);
    this.chairRoot.add(baseHub);

    // 5 Voxel Iron Spokes with Caster Wheels
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.5 });
    this.themeMaterials.push({ material: spokeMat, role: 'surface' });
    const redstoneWheelMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff3300,
      emissiveIntensity: 0.25,
    });
    this.themeMaterials.push({ material: redstoneWheelMat, role: 'highlight', emissive: true });

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.32), ironMat);
      spoke.position.set(Math.sin(angle) * 0.17, 0.08, Math.cos(angle) * 0.17);
      spoke.rotation.y = angle;
      this.chairRoot.add(spoke);

      // Blocky Voxel Wheels
      const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), spokeMat);
      wheel.position.set(Math.sin(angle) * 0.32, 0.03, Math.cos(angle) * 0.32);

      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.015, 0.015), redstoneWheelMat);
      rim.position.set(Math.sin(angle) * 0.32, 0.03, Math.cos(angle) * 0.32);

      this.chairRoot.add(wheel, rim);
    }

    // Minecraft Piston Shaft Lift (Hydraulic Rod)
    const pistonShaft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.08), ironMat);
    pistonShaft.position.set(0, 0.27, 0);
    this.chairRoot.add(pistonShaft);

    // Swiveling Voxel Seat Assembly
    this.chairSeatGroup = new THREE.Group();
    this.chairSeatGroup.position.set(0, 0.48, 0);

    // Minecraft Burgundy & Charcoal Wool Materials (Brand Palette)
    const burgundyWoolTex = createBurgundyWoolTexture();
    const burgundyWoolMat = new THREE.MeshStandardMaterial({
      map: burgundyWoolTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    this.chairUpholsteryMaterial = burgundyWoolMat;
    const blackWoolMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
    });
    this.themeMaterials.push({ material: blackWoolMat, role: 'surface' });
    const darkOakMat = new THREE.MeshStandardMaterial({
      color: 0x2e1b0e,
      roughness: 0.75,
    });
    this.themeMaterials.push({ material: darkOakMat, role: 'tertiary' });

    // 1. Minecraft Burgundy Wool Cushion Seat Base (Blocky Voxel)
    const seatCore = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.10, 0.48), burgundyWoolMat);
    seatCore.position.set(0, 0.05, 0);
    seatCore.castShadow = true;
    this.chairSeatGroup.add(seatCore);

    // Left & Right Black Wool Side Bolsters (Stepped Voxel Blocks)
    for (let i = -1; i <= 1; i += 2) {
      const bolster = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.48), blackWoolMat);
      bolster.position.set(i * 0.26, 0.08, 0);
      this.chairSeatGroup.add(bolster);
    }

    // 2. High Minecraft Voxel Backrest with Shoulder Wings
    const backCore = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.82, 0.10), burgundyWoolMat);
    backCore.position.set(0, 0.48, 0.19);
    backCore.rotation.x = 0.05;
    backCore.castShadow = true;
    this.chairSeatGroup.add(backCore);

    // Dark Oak Structural Backplate
    const backplate = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.84, 0.04), darkOakMat);
    backplate.position.set(0, 0.48, 0.24);
    backplate.rotation.x = 0.05;
    this.chairSeatGroup.add(backplate);

    // Voxel Flared Shoulder Bolsters
    for (let i = -1; i <= 1; i += 2) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.54, 0.12), blackWoolMat);
      wing.position.set(i * 0.26, 0.52, 0.18);
      this.chairSeatGroup.add(wing);
    }

    // 3. Minecraft Dual Obsidian Harness Pass-Through Cutouts
    const obsidianMat = new THREE.MeshBasicMaterial({ color: 0x120c1e });
    for (let i = -1; i <= 1; i += 2) {
      const eyelet = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.12), obsidianMat);
      eyelet.position.set(i * 0.12, 0.72, 0.21);
      eyelet.rotation.x = 0.05;
      this.chairSeatGroup.add(eyelet);
    }

    // 4. Diamond Cyan Magnetic Neck Pillow with Pixelated "EVOKE"
    const pillowCanvas = document.createElement('canvas');
    pillowCanvas.width = 128;
    pillowCanvas.height = 64;
    const pCtx = pillowCanvas.getContext('2d')!;
    pCtx.imageSmoothingEnabled = false;
    pCtx.fillStyle = '#00aaaa';
    pCtx.fillRect(0, 0, 128, 64);
    pCtx.fillStyle = '#55ffff';
    pCtx.fillRect(4, 4, 120, 56);
    pCtx.fillStyle = '#000000';
    pCtx.font = 'bold 22px monospace';
    pCtx.textAlign = 'center';
    pCtx.fillText('EVOKE', 64, 38);

    const pillowTex = new THREE.CanvasTexture(pillowCanvas);
    pillowTex.magFilter = THREE.NearestFilter;
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.12, 0.08),
      new THREE.MeshStandardMaterial({ map: pillowTex, roughness: 0.5 })
    );
    pillow.position.set(0, 0.82, 0.23);
    pillow.rotation.x = 0.05;
    this.chairSeatGroup.add(pillow);

    // 5. Blocky Iron Armrests with Wool Pads
    for (let i = -1; i <= 1; i += 2) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.05), ironMat);
      pillar.position.set(i * 0.32, 0.18, 0);

      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.26), blackWoolMat);
      pad.position.set(i * 0.32, 0.32, 0);

      this.chairSeatGroup.add(pillar, pad);
      this.registerInteractive(pad, 'chair');
    }

    this.chairRoot.add(this.chairSeatGroup);

    // Register physical interactions
    this.registerInteractive(seatCore, 'chair');
    this.registerInteractive(backCore, 'chair');
    this.registerInteractive(pillow, 'chair');

    this.battlestationGroup.add(this.chairRoot);
  }

  // ========================================================
  // ACOUSTIC HEADSET & DISPLAY STAND (Sonic Pulse Wave)
  // ========================================================
  private initHeadset() {
    const standGroup = new THREE.Group();
    standGroup.position.set(0.64, 0.875, 0.08);

    // Minecraft Iron Ingot Headphone Stand (Blocky Voxel)
    const ironStandMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.3,
    });
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), ironStandMat);
    standBase.position.set(0, 0.02, 0);
    standGroup.add(standBase);

    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.04), ironStandMat);
    pole.position.set(0, 0.16, 0);
    standGroup.add(pole);

    const hanger = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.06), ironStandMat);
    hanger.position.set(0, 0.32, 0);
    standGroup.add(hanger);

    // Minecraft Voxel Blocky Headset
    this.headsetGroup = new THREE.Group();
    this.headsetGroup.position.set(0, 0.25, 0);

    const headBandMat = new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.8 });
    const cyanCushionMat = new THREE.MeshStandardMaterial({ color: 0x00aaaa, roughness: 0.5 });
    const redstoneEarMat = new THREE.MeshBasicMaterial({ color: 0x55ffff });

    // Blocky Headband
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.035, 0.05), headBandMat);
    band.position.set(0, 0.06, 0);
    this.headsetGroup.add(band);

    // Blocky Square Earcups
    for (let i = -1; i <= 1; i += 2) {
      const earcup = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.08), headBandMat);
      earcup.position.set(i * 0.11, 0, 0);

      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.07), cyanCushionMat);
      cushion.position.set(i * 0.085, 0, 0);

      const earAccent = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.06, 0.05), redstoneEarMat);
      earAccent.position.set(i * 0.138, 0, 0);

      this.headsetGroup.add(earcup, cushion, earAccent);
      this.registerInteractive(earcup, 'headset');
    }

    standGroup.add(this.headsetGroup);

    // Sonic Pulse Voxel Rings (expanding redstone/cyan blocks)
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(0.04 + i * 0.03, 0.046 + i * 0.03, 4); // Diamond square
      const sonicMat = new THREE.MeshBasicMaterial({
        color: 0x55ffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, sonicMat);
      ring.position.set(0.64, 1.1, 0.08);
      ring.rotation.x = Math.PI / 2;
      this.sonicRings.push(ring);
      this.battlestationGroup.add(ring);
    }

    this.registerInteractive(band, 'headset');
    this.battlestationGroup.add(standGroup);
  }

  // ========================================================
  // MINECRAFT VOXEL PS5 CONSOLE (Vertical Orientation)
  // ========================================================
  private initPC() {
    this.ps5Group = new THREE.Group();
    // Placed on left flank of oak desk
    this.ps5Group.position.set(-0.76, 0.88, -0.05);

    // 1. Minecraft Blackstone Base Stand (Voxel slab)
    const baseStandMat = new THREE.MeshStandardMaterial({
      color: 0x141218,
      roughness: 0.6,
      metalness: 0.5,
    });
    const baseStand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.28), baseStandMat);
    baseStand.position.set(0, 0.015, 0);
    baseStand.receiveShadow = true;
    this.ps5Group.add(baseStand);

    // 2. Center Obsidian Block Column (Voxel core)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0a0812,
      roughness: 0.2,
      metalness: 0.85,
    });
    const centerCore = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.46, 0.22), coreMat);
    centerCore.position.set(0, 0.245, 0);
    centerCore.castShadow = true;
    this.ps5Group.add(centerCore);

    // 3. Smooth Quartz White Voxel Wing Slabs (Outer Faceplates)
    const quartzMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5fa,
      roughness: 0.35,
      metalness: 0.1,
    });

    // Left Wing Plate (with stepped top flare)
    const lWing = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.48, 0.24), quartzMat);
    lWing.position.set(-0.055, 0.255, 0);
    lWing.castShadow = true;
    const lTopStep = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.10), quartzMat);
    lTopStep.position.set(-0.055, 0.505, -0.05);
    this.ps5Group.add(lWing, lTopStep);

    // Right Wing Plate (with disc drive swell)
    const rWing = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.48, 0.24), quartzMat);
    rWing.position.set(0.055, 0.255, 0);
    rWing.castShadow = true;
    const rTopStep = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.10), quartzMat);
    rTopStep.position.set(0.055, 0.505, -0.05);
    const driveSwell = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.20, 0.18), quartzMat);
    driveSwell.position.set(0.065, 0.14, 0.02);
    this.ps5Group.add(rWing, rTopStep, driveSwell);

    // 4. Glowing Radiant Mauve & Burnt Orange LED Slits (Burgundy Theme)
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xa62b5f }); // Radiant Mauve
    this.ps5LightMesh1 = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.44, 0.015), lightMat);
    this.ps5LightMesh1.position.set(-0.046, 0.26, 0.115);

    this.ps5LightMesh2 = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.44, 0.015), lightMat);
    this.ps5LightMesh2.position.set(0.046, 0.26, 0.115);
    this.ps5Group.add(this.ps5LightMesh1, this.ps5LightMesh2);

    this.ps5GlowLight = new THREE.PointLight(0xa62b5f, 2.8, 1.8);
    this.ps5GlowLight.position.set(0, 0.28, 0.16);
    this.ps5Group.add(this.ps5GlowLight);

    // Voxel Power Diode
    this.ps5PowerLedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.012, 0.005),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.ps5PowerLedMesh.position.set(0, 0.07, 0.115);
    this.ps5Group.add(this.ps5PowerLedMesh);

    // Register interactions
    this.registerInteractive(baseStand, 'pc');
    this.registerInteractive(centerCore, 'pc');
    this.registerInteractive(lWing, 'pc');
    this.registerInteractive(rWing, 'pc');
    this.registerInteractive(this.ps5PowerLedMesh, 'pc');

    this.battlestationGroup.add(this.ps5Group);
  }

  // ========================================================
  // MINECRAFT VOXEL KEYBOARD & PRO GAMING MOUSE
  // ========================================================
  private initKeyboardAndMouse() {
    const kbGroup = new THREE.Group();
    kbGroup.position.set(0, 0.885, 0.12);

    // Voxel Keyboard Base (Stone Brick Slab)
    const kbBaseMat = new THREE.MeshStandardMaterial({
      color: 0x221f26,
      roughness: 0.6,
      metalness: 0.3,
    });
    const kbBase = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.02, 0.16), kbBaseMat);
    kbBase.position.set(0, 0.01, 0);
    kbBase.castShadow = true;
    kbGroup.add(kbBase);

    // 14x5 Individual Voxel Keycaps
    this.keyboardKeyGroup = new THREE.Group();
    const keyGeo = new THREE.BoxGeometry(0.02, 0.01, 0.02);
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x332e3a,
      roughness: 0.7,
    });
    this.themeMaterials.push({ material: keyMat, role: 'surface' });

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 14; c++) {
        const key = new THREE.Mesh(keyGeo, keyMat);
        key.position.set(-0.16 + c * 0.025, 0.022, -0.05 + r * 0.025);
        this.keyboardKeyGroup.add(key);
      }
    }
    kbGroup.add(this.keyboardKeyGroup);

    // MINECRAFT VOXEL GAMING MOUSE (Blocky Pixel Mouse)
    this.mouseGroup = new THREE.Group();
    this.mouseGroup.position.set(0.30, 0.888, 0.14);

    // Main Voxel Mouse Body
    const mouseMat = new THREE.MeshStandardMaterial({
      color: 0x181820,
      roughness: 0.4,
      metalness: 0.5,
    });
    this.themeMaterials.push({ material: mouseMat, role: 'surface' });
    this.mouseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.028, 0.12), mouseMat);
    this.mouseMesh.position.set(0, 0.014, 0);
    this.mouseMesh.castShadow = true;
    this.mouseGroup.add(this.mouseMesh);

    // Split Voxel Click Paddles
    const clickMat = new THREE.MeshStandardMaterial({ color: 0x22222c, roughness: 0.35 });
    const lClick = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.05), clickMat);
    lClick.position.set(-0.016, 0.028, -0.03);
    const rClick = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.05), clickMat);
    rClick.position.set(0.016, 0.028, -0.03);
    this.mouseGroup.add(lClick, rClick);

    // Redstone Voxel Scroll Wheel
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff3300,
      emissiveIntensity: 0.25,
    });
    this.themeMaterials.push({ material: wheelMat, role: 'highlight', emissive: true });
    const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.014, 0.022), wheelMat);
    wheel.position.set(0, 0.03, -0.025);
    this.mouseGroup.add(wheel);

    // White Quartz Glides (PTFE pads)
    const glideMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const glide1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.002, 0.016), glideMat);
    glide1.position.set(0, 0.001, -0.045);
    const glide2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.002, 0.016), glideMat);
    glide2.position.set(0, 0.001, 0.045);
    this.mouseGroup.add(glide1, glide2);

    this.registerInteractive(kbBase, 'keyboard');
    this.registerInteractive(this.mouseMesh, 'mouse');
    this.registerInteractive(wheel, 'mouse');
    this.registerInteractive(lClick, 'mouse');
    this.registerInteractive(rClick, 'mouse');

    this.battlestationGroup.add(kbGroup);
    this.battlestationGroup.add(this.mouseGroup);
  }

  // ========================================================
  // ATMOSPHERIC DUST PARTICLES & HAZE
  // ========================================================
  private initAtmosphere() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = Math.random() * 3.5;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xa62b5f,
      size: 0.018,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dustParticles);
  }

  // ========================================================
  // REGISTRATION & RAYCASTING
  // ========================================================
  private registerInteractive(object: THREE.Object3D, id: InteractiveObjectId) {
    this.interactiveMeshes.set(object, id);
    this.interactiveMeshList.push(object);
  }

  // ========================================================
  // USER ACTIONS / INTERACTION METHODS
  // ========================================================
  public triggerObjectInteraction(id: InteractiveObjectId) {
    switch (id) {
      case 'monitor_power':
        this.toggleMonitorPower();
        break;

      case 'monitor':
        // Clicking monitor zooms in to inspect the screen
        if (this.mode === 'monitor') {
          this.setMode('orbit');
        } else {
          this.setMode('monitor');
        }
        break;

      case 'chair':
        // Spin chair a complete 360 degrees
        this.spinChair360();
        break;

      case 'character_hero':
        if (this.character) {
          this.character.triggerInspect();
        }
        this.callbacks.onCharacterInspect?.();
        break;

      case 'mouse':
        soundscape.playClick(1050);
        break;

      case 'headset':
        this.headsetWobble = 1.0;
        this.emitSonicPulse();
        soundscape.playClick(920);
        break;

      case 'pc':
        this.togglePCPower();
        break;

      case 'keyboard':
        this.keyboardWaveTime = 0.01;
        soundscape.playClick(1100);
        break;

      case 'controller':
        soundscape.playClick(750);
        break;

      case 'door':
        this.isDoorOpen = !this.isDoorOpen;
        soundscape.playClick(820);
        break;

      case 'bed':
        this.bedBounceTime = 0.01;
        soundscape.playClick(650);
        break;

      case 'chest':
        this.isChestOpen = !this.isChestOpen;
        soundscape.playClick(900);
        break;

      case 'crafting_table':
        soundscape.playClick(1100);
        break;

      case 'puppy':
        this.puppyState = 'petted';
        this.puppyPetTimer = 1.8;
        soundscape.playClick(1400);
        break;

      case 'poster':
        soundscape.playClick(1300);
        break;
    }

    this.callbacks.onSelectObject(id);
  }

  public spinChair360() {
    this.chairSpinVelocity += Math.PI * 2;
    soundscape.playClick(580);
    this.callbacks.onSelectObject('chair');
  }

  public triggerSonicPulse() {
    this.headsetWobble = 0.9;
    this.emitSonicPulse();
  }

  public toggleMonitorPower() {
    this.isMonitorPowered = !this.isMonitorPowered;
    this.monitorCursorDirty = true;
    soundscape.playPowerToggle(this.isMonitorPowered);

    if (this.isMonitorPowered) {
      // Powering ON: Vivid Mauve LED & bias backlight
      (this.monitorStandbyLedMesh.material as THREE.MeshBasicMaterial).color.setHex(0xa62b5f);
      this.monitorStandbyLight.color.setHex(0xa62b5f);
      this.monitorStandbyLight.intensity = 0.9;
      this.monitorBiasLight.intensity = 2.4;
    } else {
      // Powering OFF: Burnt Orange standby LED
      (this.monitorStandbyLedMesh.material as THREE.MeshBasicMaterial).color.setHex(0xe66a3a);
      this.monitorStandbyLight.color.setHex(0xe66a3a);
      this.monitorStandbyLight.intensity = 0.4;
      this.monitorBiasLight.intensity = 0.2;
    }

    this.callbacks.onMonitorPowerToggle(this.isMonitorPowered);
    this.callbacks.onSelectObject('monitor_power');
  }

  public togglePCPower() {
    this.isPCPowered = !this.isPCPowered;
    soundscape.playPowerToggle(this.isPCPowered);

    if (this.isPCPowered) {
      if (this.ps5GlowLight) this.ps5GlowLight.intensity = 2.8;
      if (this.ps5LightMesh1) (this.ps5LightMesh1.material as THREE.MeshBasicMaterial).color.setHex(0xa62b5f);
      if (this.ps5LightMesh2) (this.ps5LightMesh2.material as THREE.MeshBasicMaterial).color.setHex(0xa62b5f);
      if (this.ps5PowerLedMesh) (this.ps5PowerLedMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf4f0ea);
    } else {
      if (this.ps5GlowLight) this.ps5GlowLight.intensity = 0.0;
      if (this.ps5LightMesh1) (this.ps5LightMesh1.material as THREE.MeshBasicMaterial).color.setHex(0x1a0d05);
      if (this.ps5LightMesh2) (this.ps5LightMesh2.material as THREE.MeshBasicMaterial).color.setHex(0x1a0d05);
      if (this.ps5PowerLedMesh) (this.ps5PowerLedMesh.material as THREE.MeshBasicMaterial).color.setHex(0x331008);
    }

    this.callbacks.onPCPowerToggle(this.isPCPowered);
    this.callbacks.onSelectObject('pc');
  }

  private emitSonicPulse() {
    this.sonicRings.forEach((ring, idx) => {
      ring.scale.set(0.8, 0.8, 0.8);
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.9;
      this.sonicRingDelays[idx] = -(idx * 0.1);
    });
  }

  // ----------------------------------------------------
  // SCROLL PROGRESS INTEGRATION (0 to 1)
  // ----------------------------------------------------
  public setScrollProgress(progress: number) {
    this.scrollProgress = Math.min(Math.max(progress, 0), 1);
    soundscape.updateScroll(this.scrollProgress);

    // If in normal orbit mode and NOT actively user-dragging, adjust subtle camera framing with scroll story
    if (this.mode === 'orbit' && !this.isPointerDown) {
      const p = this.scrollProgress;
      if (p <= 0.25) {
        // Stage 1: Moody room overview
        this.targetSpherical.radius = this.isPortraitViewport
          ? THREE.MathUtils.lerp(5.2, 4.8, p / 0.25)
          : THREE.MathUtils.lerp(3.4, 3.2, p / 0.25);
        if (!this.isUserOrbited || p > 0.02) {
          this.targetSpherical.phi = THREE.MathUtils.lerp(1.22, 1.25, p / 0.25);
          this.targetSpherical.theta = this.isPortraitViewport
            ? THREE.MathUtils.lerp(0.16, 0.22, p / 0.25)
            : THREE.MathUtils.lerp(0.38, 0.26, p / 0.25);
        }
        this.targetLookAt.set(this.isPortraitViewport ? 1.22 : 0, this.isPortraitViewport ? 2.1 : 0.95, 0);
      } else if (p <= 0.6) {
        // Stage 2: Kinetic focus on setup
        const t = (p - 0.25) / 0.35;
        this.targetSpherical.radius = THREE.MathUtils.lerp(3.2, 2.9, t);
        this.targetSpherical.phi = THREE.MathUtils.lerp(1.25, 1.28, t);
        this.targetSpherical.theta = THREE.MathUtils.lerp(0.26, 0.12, t);
        this.targetLookAt.set(0, 0.98, 0);
      } else if (p <= 0.85) {
        // Stage 3: Monitor focal point
        const t = (p - 0.6) / 0.25;
        this.targetSpherical.radius = THREE.MathUtils.lerp(2.9, 2.7, t);
        this.targetSpherical.phi = THREE.MathUtils.lerp(1.28, 1.32, t);
        this.targetSpherical.theta = THREE.MathUtils.lerp(0.12, 0.04, t);
        this.targetLookAt.set(0, 1.05, -0.05);
      } else {
        // Stage 4: Grand reveal composition
        const t = (p - 0.85) / 0.15;
        this.targetSpherical.radius = THREE.MathUtils.lerp(2.7, 3.4, t);
        this.targetSpherical.phi = THREE.MathUtils.lerp(1.32, 1.26, t);
        this.targetSpherical.theta = THREE.MathUtils.lerp(0.04, 0.08, t);
        this.targetLookAt.set(0, 0.98, 0);
      }

      // Shift environmental lighting subtly with scroll
      this.mauveSpotLight.intensity = THREE.MathUtils.lerp(3.8, 5.2, p);
      this.ambientLight.intensity = THREE.MathUtils.lerp(0.85, 1.1, p);
    }
  }

  public setMode(newMode: 'orbit' | 'monitor' | 'reveal') {
    this.mode = newMode;

    if (newMode === 'monitor') {
      // Zoom right in on the monitor screen on the right side
      const setupX = this.battlestationGroup ? this.battlestationGroup.position.x : 1.22;
      this.targetSpherical.radius = 1.35;
      this.targetSpherical.phi = 1.48;
      this.targetSpherical.theta = 0.01;
      this.targetLookAt.set(setupX, 1.24, -0.15);
    } else if (newMode === 'reveal') {
      // Epic low-angle centered framing
      this.targetSpherical.radius = 3.8;
      this.targetSpherical.phi = 1.35;
      this.targetSpherical.theta = 0.0;
      this.targetLookAt.set(this.isPortraitViewport ? 1.22 : 0, this.isPortraitViewport ? 2.1 : 1.05, 0);
    } else {
      // Return to orbit mode (re-aligns to scroll position)
      this.targetLookAt.set(0, 0.95, 0);
      this.setScrollProgress(this.scrollProgress);
    }
  }

  // ========================================================
  // INPUT & GESTURE EVENT HANDLERS
  // ========================================================
  private bindEvents() {
    const el = this.renderer.domElement;

    let touchStartPos = { x: 0, y: 0 };
    let isTouchInput = false;
    let isTouchScrolling = false;

    // Pointer Down (Mouse / Touch)
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isTouchInput = 'touches' in e;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      this.pointerStart.x = clientX;
      this.pointerStart.y = clientY;
      touchStartPos = { x: clientX, y: clientY };
      isTouchScrolling = false;
      this.sphericalStart.phi = this.targetSpherical.phi;
      this.sphericalStart.theta = this.targetSpherical.theta;

      this.updatePointerCoords(clientX, clientY);

      // Raycast to check for interactive objects
      this.raycaster.setFromCamera(this.pointer, this.camera);
      this.raycastHits.length = 0;
      const intersects = this.raycaster.intersectObjects(this.interactiveMeshList, false, this.raycastHits);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const objectId = this.interactiveMeshes.get(hitMesh) || this.findParentInteractiveId(hitMesh);

        // 1. Controller Drag Initiate
        if (objectId === 'controller') {
          this.isDraggingController = true;
          this.controllerDragPos.copy(this.controllerGroup.position);
          this.controllerDragPos.y = 0.89 + 0.16; // Lift up off desk
          this.callbacks.onControllerDragStart();
          soundscape.playClick(820);
          return;
        }

        // 2. Chair Drag Initiate (Allows 360 degree spin and floor glide)
        if (objectId === 'chair') {
          this.isDraggingChair = true;
          this.chairDragStartCoord = { x: clientX, y: clientY };
          this.chairDragStartSwivel = this.chairSwivelAngle;
          // Calculate offset on floor plane
          const hitFloor = this.dragIntersection;
          if (this.raycaster.ray.intersectPlane(this.chairFloorPlane, hitFloor)) {
            const localFloor = this.battlestationGroup.worldToLocal(hitFloor);
            this.chairDragOffset.subVectors(this.chairRoot.position, localFloor);
          }
          this.callbacks.onChairDragStart();
          soundscape.playClick(680);
          return;
        }

        // 3. Mouse Drag Initiate (Glide mouse on desk to move monitor cursor)
        if (objectId === 'mouse') {
          this.isDraggingMouse = true;
          this.callbacks.onMouseDragStart?.();
          soundscape.playClick(1050);
          return;
        }

        // 4. Any other interactive object (character_hero/statue, monitor, pc, headset, etc.)
        if (objectId) {
          this.clickedObjectId = objectId;
          this.isPointerDown = true;
          return;
        }
      }

      this.clickedObjectId = null;
      this.isPointerDown = true;
    };

    // Pointer Move
    const processPointerMove = (clientX: number, clientY: number, isTouch: boolean) => {
      this.updatePointerCoords(clientX, clientY);

      // Mouse Parallax target
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = -(clientY / window.innerHeight) * 2 + 1;
      this.mouseParallax.targetX = nx * 0.1;
      this.mouseParallax.targetY = ny * 0.06;

      // If clicked an interactive object and mouse moved significantly, cancel click
      if (this.clickedObjectId) {
        const dist = Math.hypot(clientX - this.pointerStart.x, clientY - this.pointerStart.y);
        if (dist > 15) {
          this.clickedObjectId = null;
        }
      }

      // 1. Controller Dragging in 3D
      if (this.isDraggingController) {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersectPoint = this.dragIntersection;
        if (this.raycaster.ray.intersectPlane(this.deskDragPlane, intersectPoint)) {
          const localPoint = this.battlestationGroup.worldToLocal(intersectPoint);
          // Clamp to desk bounds
          let targetX = THREE.MathUtils.clamp(localPoint.x, -0.65, 0.65);
          let targetZ = THREE.MathUtils.clamp(localPoint.z, -0.15, 0.42);

          // Avoid Keyboard (center approx x=0, z=0.08)
          if (targetX > -0.22 && targetX < 0.22 && targetZ > -0.05 && targetZ < 0.22) {
             if (Math.abs(targetX) > Math.abs(targetZ - 0.08)) {
                 targetX = targetX > 0 ? 0.22 : -0.22;
             } else {
                 targetZ = targetZ > 0.08 ? 0.22 : -0.05;
             }
          }
          // Avoid PS5 and Stand
          if (targetX < -0.55 && targetZ < 0.15) targetX = -0.55;
          if (targetX > 0.45 && targetZ < 0.15) targetX = 0.45;

          const targetY = 0.89 + 0.16; // Lifted above desk

          this.controllerVelocity.set(
            (targetX - this.controllerDragPos.x) * 0.5,
            0,
            (targetZ - this.controllerDragPos.z) * 0.5
          );

          this.controllerDragPos.set(targetX, targetY, targetZ);
        }
        return;
      }

      // 2. Gaming Mouse Dragging (Moves cursor live on monitor screen!)
      if (this.isDraggingMouse) {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersectPoint = this.dragIntersection;
        if (this.raycaster.ray.intersectPlane(this.deskDragPlane, intersectPoint)) {
          const localPoint = this.battlestationGroup.worldToLocal(intersectPoint);
          const clampedX = THREE.MathUtils.clamp(localPoint.x, 0.22, 0.48);
          const clampedZ = THREE.MathUtils.clamp(localPoint.z, -0.06, 0.28);
          this.mouseGroup.position.set(clampedX, 0.885, clampedZ);

          const normX = (clampedX - 0.22) / (0.48 - 0.22);
          const normY = (clampedZ - (-0.06)) / (0.28 - (-0.06));
          const cursorX = THREE.MathUtils.clamp(normX * 1024, 25, 995);
          const cursorY = THREE.MathUtils.clamp((1.0 - normY) * 512, 25, 485);
          if (cursorX !== this.monitorCursorX || cursorY !== this.monitorCursorY) {
            this.monitorCursorX = cursorX;
            this.monitorCursorY = cursorY;
            this.monitorCursorDirty = true;
          }
          this.callbacks.onMouseDrag?.(normX, normY);
        }
        return;
      }

      // 3. Gaming Chair Dragging in 3D (360° spin + floor gliding)
      if (this.isDraggingChair) {
        const deltaX = clientX - this.chairDragStartCoord.x;
        // Continuous 360 degree spin rotation as chair is dragged horizontally
        this.chairTargetSwivel = this.chairDragStartSwivel + deltaX * 0.022;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersectFloor = this.dragIntersection;
        if (this.raycaster.ray.intersectPlane(this.chairFloorPlane, intersectFloor)) {
          const localFloor = this.battlestationGroup.worldToLocal(intersectFloor);
          const rawTargetX = localFloor.x + this.chairDragOffset.x;
          const rawTargetZ = localFloor.z + this.chairDragOffset.z;
          const targetX = THREE.MathUtils.clamp(rawTargetX, -1.3, 1.3);
          const targetZ = THREE.MathUtils.clamp(rawTargetZ, 0.95, 1.8);

          this.chairVelocity.set(
            (targetX - this.chairPos.x) * 0.4,
            0,
            (targetZ - this.chairPos.z) * 0.4
          );

          this.chairTargetPos.set(targetX, 0, targetZ);
        }
        return;
      }

      // 4. Camera Orbit Rotation & Touch Mobile Scroll
      if (this.isPointerDown) {
        const deltaX = clientX - this.pointerStart.x;
        const deltaY = clientY - this.pointerStart.y;

        if (isTouch) {
          const absX = Math.abs(clientX - touchStartPos.x);
          const absY = Math.abs(clientY - touchStartPos.y);

          // If touch gesture is predominantly vertical, scroll the window!
          if (isTouchScrolling || (absY > 6 && absY > absX * 0.75)) {
            isTouchScrolling = true;
            window.scrollBy(0, -deltaY);
            this.pointerStart.x = clientX;
            this.pointerStart.y = clientY;
            return;
          }
        }

        const sensitivity = 0.0055;
        this.targetSpherical.theta -= deltaX * sensitivity;
        this.isUserOrbited = true;
        if (!isTouch) {
          this.targetSpherical.phi = THREE.MathUtils.clamp(
            this.targetSpherical.phi - deltaY * sensitivity,
            0.4,
            Math.PI / 2 - 0.02
          );
        }
        this.pointerStart.x = clientX;
        this.pointerStart.y = clientY;
        return;
      }

      // 5. Hover Raycasting Detection
      this.hoverClientX = clientX;
      this.hoverClientY = clientY;
      this.performHoverCheck(clientX, clientY);
    };

    this.flushPendingPointerMove = () => {
      if (!this.hasPendingPointerMove) return;
      const { x, y, isTouch } = this.pendingPointerMove;
      this.hasPendingPointerMove = false;
      const startedAt = this.devPerfEnabled ? performance.now() : 0;
      processPointerMove(x, y, isTouch);
      if (this.devPerfEnabled) {
        this.devPerfPointerMoveCount += 1;
        const duration = performance.now() - startedAt;
        this.devPerfPointerMoveTotalMs += duration;
        this.devPerfPointerMoveMaxMs = Math.max(this.devPerfPointerMoveMaxMs, duration);
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const isTouch = 'touches' in e;
      this.pendingPointerMove.x = isTouch ? e.touches[0].clientX : e.clientX;
      this.pendingPointerMove.y = isTouch ? e.touches[0].clientY : e.clientY;
      this.pendingPointerMove.isTouch = isTouch;
      this.hasPendingPointerMove = true;
      if (this.devPerfEnabled) this.devPerfRawPointerEventCount += 1;
    };

    // Pointer Up
    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      this.flushPendingPointerMove?.();
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      const dist = Math.hypot(clientX - touchStartPos.x, clientY - touchStartPos.y);

      if (this.isDraggingController) {
        this.isDraggingController = false;
        // Settle controller down on desk surface at drop location
        this.controllerRestPos.copy(this.controllerDragPos);
        this.controllerRestPos.y = 0.89; // Desk surface level
        this.callbacks.onControllerDragEnd();
        this.callbacks.onSelectObject('controller');
        soundscape.playClick(620);
      } else if (this.isDraggingChair) {
        this.isDraggingChair = false;
        this.callbacks.onChairDragEnd();
        this.callbacks.onSelectObject('chair');
        soundscape.playClick(580);
      } else if (this.isDraggingMouse) {
        this.isDraggingMouse = false;
        this.callbacks.onMouseDragEnd?.();
        this.callbacks.onSelectObject('mouse');
        soundscape.playClick(980);
      } else if (this.clickedObjectId) {
        if (dist < 15) {
          this.triggerObjectInteraction(this.clickedObjectId);
        }
        this.clickedObjectId = null;
      } else if (dist < 8 && !isTouchScrolling) {
        // Distinct click / tap on object
        this.updatePointerCoords(clientX, clientY);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        this.raycastHits.length = 0;
        const intersects = this.raycaster.intersectObjects(this.interactiveMeshList, false, this.raycastHits);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          const objectId = this.interactiveMeshes.get(hitMesh) || this.findParentInteractiveId(hitMesh);
          if (objectId) {
            this.triggerObjectInteraction(objectId);
          }
        }
      }

      this.isPointerDown = false;
      this.clickedObjectId = null;
      isTouchScrolling = false;
    };

    // Reset interaction state if window loses focus
    const onWindowBlur = () => {
      this.isPointerDown = false;
      this.isDraggingChair = false;
      this.isDraggingController = false;
      this.isDraggingMouse = false;
      this.clickedObjectId = null;
      this.hasPendingPointerMove = false;
      isTouchScrolling = false;
    };

    // Mouse Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      // If user zooms via wheel while in monitor mode, allow zooming in/out
      if (this.mode === 'monitor') {
        const zoomFactor = e.deltaY * 0.0015;
        this.targetSpherical.radius = THREE.MathUtils.clamp(
          this.targetSpherical.radius + zoomFactor,
          0.9,
          2.6
        );
      }
    };

    // Window Resize
    const onResize = () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      const aspect = w / h;
      const wasPortrait = this.isPortraitViewport;
      this.isPortraitViewport = aspect < 0.85;
      this.camera.aspect = aspect;
      this.camera.fov = this.isPortraitViewport ? 60 : w < 768 || aspect < 1.0 ? 54 : 44;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      if (wasPortrait !== this.isPortraitViewport) {
        this.character?.setWorldPosition(
          this.isPortraitViewport
            ? new THREE.Vector3(1.22, 2.3, 0.12)
            : new THREE.Vector3(-1.42, 0, 0.12)
        );
        if (this.mode === 'orbit') this.setScrollProgress(this.scrollProgress);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if ((this.isDraggingChair || this.isDraggingController || this.isDraggingMouse) && e.cancelable) {
        e.preventDefault();
      }
      onPointerMove(e);
    };

    el.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('blur', onWindowBlur);
    el.addEventListener('wheel', onWheel, { passive: true });

    el.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onPointerUp, { passive: true });
    window.addEventListener('resize', onResize);
    this.removeEventListeners = () => {
      el.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('blur', onWindowBlur);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', onResize);
    };
  }

  private updatePointerCoords(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  private findParentInteractiveId(mesh: THREE.Object3D): InteractiveObjectId | null {
    let curr: THREE.Object3D | null = mesh;
    while (curr) {
      if (this.interactiveMeshes.has(curr)) {
        return this.interactiveMeshes.get(curr)!;
      }
      curr = curr.parent;
    }
    return null;
  }

  private performHoverCheck(clientX: number, clientY: number) {
    if (this.pointer.x === this.lastHoverPointerX && this.pointer.y === this.lastHoverPointerY) return;
    this.lastHoverPointerX = this.pointer.x;
    this.lastHoverPointerY = this.pointer.y;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const raycastStartedAt = this.devPerfEnabled ? performance.now() : 0;
    this.raycastHits.length = 0;
    const intersects = this.raycaster.intersectObjects(
      this.interactiveMeshList,
      false,
      this.raycastHits
    );
    if (this.devPerfEnabled) {
      const raycastDuration = performance.now() - raycastStartedAt;
      this.devPerfHoverTotalMs += raycastDuration;
      this.devPerfHoverMaxMs = Math.max(this.devPerfHoverMaxMs, raycastDuration);
      this.devPerfHoverCount += 1;
    }

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const objectId = this.interactiveMeshes.get(hitMesh) || this.findParentInteractiveId(hitMesh);

      if (objectId !== this.hoveredId) {
        this.hoveredId = objectId;
        this.renderer.domElement.style.cursor =
          objectId === 'controller' || objectId === 'chair' ? 'grab' : 'pointer';
        this.callbacks.onHoverObject(objectId, { x: clientX, y: clientY });
      }

      this.isKeyboardHovered = objectId === 'keyboard';
    } else {
      if (this.hoveredId !== null) {
        this.hoveredId = null;
        this.renderer.domElement.style.cursor = 'default';
        this.callbacks.onHoverObject(null);
      }
      this.isKeyboardHovered = false;
    }
  }

  // ========================================================
  // RENDER & ANIMATION TICK
  // ========================================================
  private updateCameraPosition() {
    this.currentSpherical.radius += (this.targetSpherical.radius - this.currentSpherical.radius) * 0.08;
    this.currentSpherical.phi += (this.targetSpherical.phi - this.currentSpherical.phi) * 0.08;
    this.currentSpherical.theta += (this.targetSpherical.theta - this.currentSpherical.theta) * 0.08;

    this.currentLookAt.lerp(this.targetLookAt, 0.08);

    this.mouseParallax.x += (this.mouseParallax.targetX - this.mouseParallax.x) * 0.05;
    this.mouseParallax.y += (this.mouseParallax.targetY - this.mouseParallax.y) * 0.05;

    const sinPhi = Math.sin(this.currentSpherical.phi);
    const cosPhi = Math.cos(this.currentSpherical.phi);
    const sinTheta = Math.sin(this.currentSpherical.theta);
    const cosTheta = Math.cos(this.currentSpherical.theta);
    const r = this.currentSpherical.radius;

    const x = r * sinPhi * sinTheta + this.mouseParallax.x;
    const y = r * cosPhi + this.mouseParallax.y;
    const z = r * sinPhi * cosTheta;

    this.camera.position.set(
      this.currentLookAt.x + x,
      this.currentLookAt.y + y,
      this.currentLookAt.z + z
    );
    this.camera.lookAt(this.currentLookAt);
  }

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const frameStartedAt = this.devPerfEnabled ? performance.now() : 0;
    this.flushPendingPointerMove?.();
    const updateStartedAt = this.devPerfEnabled ? performance.now() : 0;
    const delta = this.clock.getDelta();
    const time = this.clock.elapsedTime;

    // 1. Camera
    const cameraStartedAt = this.devPerfEnabled ? performance.now() : 0;
    this.updateCameraPosition();
    if (this.devPerfEnabled) this.recordDevFunctionTiming('camera', cameraStartedAt);

    // 1b. Update 3D Character on Left (breathing, ball spin, head tracking)
    if (this.character) {
      const characterStartedAt = this.devPerfEnabled ? performance.now() : 0;
      this.character.update(
        time,
        delta,
        THREE.MathUtils.clamp(this.pointer.x, -1, 1),
        THREE.MathUtils.clamp(this.pointer.y, -1, 1)
      );
      if (this.devPerfEnabled) this.recordDevFunctionTiming('character', characterStartedAt);
    }

    // 2. Controller Dynamics (Drag & Settle Physics)
    if (this.isDraggingController) {
      this.controllerGroup.position.lerp(this.controllerDragPos, 0.25);
      this.controllerGroup.rotation.z = -this.controllerVelocity.x * 3.0;
      this.controllerGroup.rotation.x = -0.22 + this.controllerVelocity.z * 2.2;
    } else {
      this.controllerGroup.position.lerp(this.controllerRestPos, 0.12);
      this.controllerGroup.rotation.x = THREE.MathUtils.lerp(
        this.controllerGroup.rotation.x,
        this.controllerRestRot.x,
        0.1
      );
      this.controllerGroup.rotation.y = THREE.MathUtils.lerp(
        this.controllerGroup.rotation.y,
        this.controllerRestRot.y,
        0.1
      );
      this.controllerGroup.rotation.z = THREE.MathUtils.lerp(
        this.controllerGroup.rotation.z,
        this.controllerRestRot.z,
        0.1
      );
      this.controllerDragPos.copy(this.controllerGroup.position);
    }

    // 3. Chair Dragging & Inertia Physics
    if (this.isDraggingChair) {
      this.chairPos.lerp(this.chairTargetPos, 0.22);
      this.chairRoot.position.copy(this.chairPos);
    } else {
      // Natural inertia coasting and settling damping
      if (this.chairVelocity.lengthSq() > 0.00001) {
        this.chairPos.add(this.chairVelocity);
        this.chairPos.x = THREE.MathUtils.clamp(this.chairPos.x, -1.3, 1.3);
        this.chairPos.z = THREE.MathUtils.clamp(this.chairPos.z, 0.38, 1.8);
        this.chairRoot.position.copy(this.chairPos);
        this.chairVelocity.multiplyScalar(0.88); // Friction
      }
    }

    // Chair 360° Swivel & Spin Physics
    this.chairSwivelAngle += (this.chairTargetSwivel - this.chairSwivelAngle) * 0.12 + this.chairSpinVelocity;
    this.chairSpinVelocity *= 0.92;
    if (this.chairSeatGroup) {
      this.chairSeatGroup.rotation.y = this.chairSwivelAngle;
    }

    // 4. Headset Wobble
    if (this.headsetWobble > 0.001) {
      this.headsetGroup.rotation.z = Math.sin(time * 22) * this.headsetWobble * 0.15;
      this.headsetWobble *= 0.93;
    } else {
      this.headsetGroup.rotation.z = 0;
    }

    // 5. PS5 Console Lightbar Breathing & Pulse
    if (this.ps5LightMesh1 && this.isPCPowered) {
      const pulse = Math.sin(time * 2.8) * 0.15 + 0.85;
      if (this.ps5GlowLight) {
        this.ps5GlowLight.intensity = 2.2 * pulse;
      }
    }

    // 6. Monitor Screen Canvas Animation & Power Transitions
    const previousBootProgress = this.monitorBootProgress;
    const isBooting = previousBootProgress > 0 && previousBootProgress < 1.0;
    if (this.isMonitorPowered) {
      this.monitorBootProgress = Math.min(this.monitorBootProgress + 0.035, 1.0);
    } else {
      this.monitorBootProgress = Math.max(this.monitorBootProgress - 0.04, 0.0);
    }
    if ((previousBootProgress > 0.1) !== (this.monitorBootProgress > 0.1)) {
      this.monitorCursorDirty = true;
    }
    const now = performance.now();
    if (isBooting || this.lastMonitorDrawTime === 0) {
      this.lastMonitorDrawTime = now;
      const monitorDrawStartedAt = this.devPerfEnabled ? performance.now() : 0;
      this.drawMonitorScreen(time);
      if (this.devPerfEnabled) this.recordDevFunctionTiming('monitorCanvas', monitorDrawStartedAt);
    }
    if (this.monitorCursorDirty) this.drawMonitorCursor();
    (this.monitorCursorMesh.material as THREE.MeshBasicMaterial).opacity = this.monitorBootProgress;

    // 7. Keyboard Reactive Light Waves
    if (this.isKeyboardHovered || this.keyboardWaveTime > 0) {
      const keys = this.keyboardKeyGroup.children as THREE.Mesh[];
      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        const wave = Math.sin(time * 6 - lastKey.position.x * 12) * 0.5 + 0.5;
        const color = wave > 0.6 ? this.themePalette.accent : this.themePalette.surface;
        if (color !== this.keyboardWaveColor) {
          (lastKey.material as THREE.MeshStandardMaterial).color.set(color);
          this.keyboardWaveColor = color;
        }
      }
      if (this.keyboardWaveTime > 0) {
        this.keyboardWaveTime += 0.02;
        if (this.keyboardWaveTime > 2.0) this.keyboardWaveTime = 0;
      }
    }

    // 8. Atmospheric Dust Particle Drift
    if (this.dustParticles && Math.floor(time * 30) !== Math.floor((time - delta) * 30)) {
      const pos = this.dustParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += 0.0012 * (delta * 60);
        if (pos[i] > 3.5) pos[i] = 0.2;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 9. Door Opening Swivel Animation
    if (this.doorSlabGroup) {
      const targetDoorRot = this.isDoorOpen ? -Math.PI / 2.2 : 0;
      this.doorSlabGroup.rotation.y += (targetDoorRot - this.doorSlabGroup.rotation.y) * 0.12;
    }

    // 10. Storage Chest Lid Animation
    if (this.chestLidGroup) {
      const targetLidRot = this.isChestOpen ? -Math.PI / 2.5 : 0;
      this.chestLidGroup.rotation.x += (targetLidRot - this.chestLidGroup.rotation.x) * 0.12;
    }

    // 11. Bed Mattress Bounce Animation
    if (this.bedBounceTime > 0 && this.bedMattressMesh) {
      this.bedBounceTime += delta;
      this.bedMattressMesh.position.y = 0.36 + Math.sin(this.bedBounceTime * 18) * 0.05 * Math.exp(-this.bedBounceTime * 3);
      if (this.bedBounceTime > 1.5) {
        this.bedBounceTime = 0;
        this.bedMattressMesh.position.y = 0.36;
      }
    }

    // 12. Free-Roaming Minecraft Puppy Autonomous AI
    const puppyStartedAt = this.devPerfEnabled ? performance.now() : 0;
    this.updatePuppy(time, delta);
    if (this.devPerfEnabled) this.recordDevFunctionTiming('puppy', puppyStartedAt);

    // Sonic pulses share the scene loop so they can be profiled and cancelled with it.
    for (let i = 0; i < this.sonicRings.length; i += 1) {
      const ring = this.sonicRings[i];
      const delay = this.sonicRingDelays[i];
      if (delay < 0) {
        this.sonicRingDelays[i] = Math.min(0, delay + delta);
      } else if (delay === 0 && (ring.material as THREE.MeshBasicMaterial).opacity > 0.02) {
        const frameScale = delta * 60;
        ring.scale.addScalar(0.04 * frameScale);
        (ring.material as THREE.MeshBasicMaterial).opacity *= Math.pow(0.92, frameScale);
        if ((ring.material as THREE.MeshBasicMaterial).opacity <= 0.02) {
          this.sonicRingDelays[i] = 0.0001;
        }
      }
    }

    if (this.devPerfEnabled) {
      const updateDuration = performance.now() - updateStartedAt;
      this.devPerfUpdateTotalMs += updateDuration;
      this.devPerfUpdateMaxMs = Math.max(this.devPerfUpdateMaxMs, updateDuration);
    }

    // Render
    const renderStartedAt = this.devPerfEnabled ? performance.now() : 0;
    this.renderer.render(this.scene, this.camera);

    if (this.devPerfEnabled) {
      const renderDuration = performance.now() - renderStartedAt;
      this.devPerfRenderTotalMs += renderDuration;
      this.devPerfRenderMaxMs = Math.max(this.devPerfRenderMaxMs, renderDuration);
      const frameDuration = performance.now() - frameStartedAt;
      this.devPerfFrameCount += 1;
      this.devPerfFrameTotalMs += frameDuration;
      this.devPerfFrameMaxMs = Math.max(this.devPerfFrameMaxMs, frameDuration);
      if (frameDuration > 32) {
        this.devPerfSpikes.push(frameDuration);
        if (this.devPerfSpikes.length > 20) this.devPerfSpikes.shift();
      }
      const now = performance.now();
      if (now - this.devPerfWindowStart >= 1000) {
        const intervalMs = now - this.devPerfWindowStart;
        (window as Window & { __EVOKE_PERF__?: Record<string, unknown> }).__EVOKE_PERF__ = {
          intervalMs,
          fps: (this.devPerfFrameCount * 1000) / intervalMs,
          frameCount: this.devPerfFrameCount,
          averageCpuFrameMs: this.devPerfFrameCount ? this.devPerfFrameTotalMs / this.devPerfFrameCount : 0,
          maxCpuFrameMs: this.devPerfFrameMaxMs,
          averageSceneUpdateMs: this.devPerfFrameCount ? this.devPerfUpdateTotalMs / this.devPerfFrameCount : 0,
          maxSceneUpdateMs: this.devPerfUpdateMaxMs,
          averageRenderSubmissionMs: this.devPerfFrameCount ? this.devPerfRenderTotalMs / this.devPerfFrameCount : 0,
          maxRenderSubmissionMs: this.devPerfRenderMaxMs,
          averagePointerMoveMs: this.devPerfPointerMoveCount ? this.devPerfPointerMoveTotalMs / this.devPerfPointerMoveCount : 0,
          maxPointerMoveMs: this.devPerfPointerMoveMaxMs,
          pointerMoveCount: this.devPerfPointerMoveCount,
          rawPointerEventCount: this.devPerfRawPointerEventCount,
          averageHoverRaycastMs: this.devPerfHoverCount ? this.devPerfHoverTotalMs / this.devPerfHoverCount : 0,
          maxHoverRaycastMs: this.devPerfHoverMaxMs,
          hoverRaycastCount: this.devPerfHoverCount,
          sceneInitMs: this.devSceneInitMs,
          longTaskCount: this.devPerfLongTaskCount,
          maxLongTaskMs: this.devPerfLongTaskMaxMs,
          frameSpikes: this.devPerfSpikes.length,
          latestSpikeMs: this.devPerfSpikes[this.devPerfSpikes.length - 1] ?? 0,
          frameSpikeMs: [...this.devPerfSpikes],
          functionTimings: { ...this.devPerfFunctions },
          drawCalls: this.renderer.info.render.calls,
          triangles: this.renderer.info.render.triangles,
          geometries: this.renderer.info.memory.geometries,
          textures: this.renderer.info.memory.textures,
        };
        this.devPerfWindowStart = now;
        this.devPerfFrameCount = 0;
        this.devPerfFrameTotalMs = 0;
        this.devPerfFrameMaxMs = 0;
        this.devPerfHoverTotalMs = 0;
        this.devPerfHoverMaxMs = 0;
        this.devPerfHoverCount = 0;
        this.devPerfPointerMoveCount = 0;
        this.devPerfRawPointerEventCount = 0;
        this.devPerfPointerMoveTotalMs = 0;
        this.devPerfPointerMoveMaxMs = 0;
        this.devPerfLongTaskCount = 0;
        this.devPerfLongTaskMaxMs = 0;
        this.devPerfSpikes = [];
        this.devPerfFunctions = {};
        this.devPerfUpdateTotalMs = 0;
        this.devPerfUpdateMaxMs = 0;
        this.devPerfRenderTotalMs = 0;
        this.devPerfRenderMaxMs = 0;
      }
    }
  };

  private recordDevFunctionTiming(name: string, startedAt: number) {
    const duration = performance.now() - startedAt;
    const timing = this.devPerfFunctions[name] ?? { totalMs: 0, maxMs: 0, calls: 0 };
    timing.totalMs += duration;
    timing.maxMs = Math.max(timing.maxMs, duration);
    timing.calls += 1;
    this.devPerfFunctions[name] = timing;
  }

  private updatePuppy(time: number, delta: number) {
    if (!this.puppyGroup) return;

    if (this.puppyState === 'petted') {
      this.puppyPetTimer -= delta;
      const hop = Math.abs(Math.sin(time * 16)) * 0.14;
      this.puppyGroup.position.y = hop;

      if (this.puppyHeadGroup) {
        this.puppyHeadGroup.rotation.y = Math.sin(time * 8) * 0.25;
        this.puppyHeadGroup.rotation.x = -0.15;
      }
      if (this.puppyTail) {
        this.puppyTail.rotation.y = Math.sin(time * 30) * 0.55;
      }

      if (this.puppyPetTimer <= 0) {
        this.puppyState = 'idle';
        this.puppyGroup.position.y = 0;
        if (this.puppyHeadGroup) this.puppyHeadGroup.rotation.set(0, 0, 0);
      }
      return;
    }

    if (this.puppyState === 'walking') {
      const dx = this.puppyTargetPos.x - this.puppyPos.x;
      const dz = this.puppyTargetPos.z - this.puppyPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.22) {
        // Arrived at target point, sit down or rest
        this.puppyState = Math.random() > 0.4 ? 'sitting' : 'idle';
        this.puppyTimer = 2.0 + Math.random() * 3.5;
        this.puppyLegs.forEach((leg) => (leg.rotation.x = 0));
        return;
      }

      // Turn towards target heading
      const targetAngle = Math.atan2(dx, dz);
      let angleDiff = targetAngle - this.puppyHeading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.puppyHeading += angleDiff * 0.08;
      this.puppyGroup.rotation.y = this.puppyHeading;

      // Move forward smoothly
      const speed = 0.72 * delta;
      this.puppyPos.x += Math.sin(this.puppyHeading) * speed;
      this.puppyPos.z += Math.cos(this.puppyHeading) * speed;
      this.puppyGroup.position.copy(this.puppyPos);

      // Leg walk cycle
      const swing = Math.sin(time * 12) * 0.45;
      if (this.puppyLegs.length === 4) {
        this.puppyLegs[0].rotation.x = swing;
        this.puppyLegs[1].rotation.x = -swing;
        this.puppyLegs[2].rotation.x = -swing;
        this.puppyLegs[3].rotation.x = swing;
      }

      // Tail wagging
      if (this.puppyTail) {
        this.puppyTail.rotation.y = Math.sin(time * 14) * 0.35;
      }
      if (this.puppyHeadGroup) {
        this.puppyHeadGroup.rotation.set(0, 0, 0);
      }

    } else if (this.puppyState === 'sitting') {
      this.puppyGroup.rotation.x = THREE.MathUtils.lerp(this.puppyGroup.rotation.x, -0.28, 0.1);
      if (this.puppyHeadGroup) {
        this.puppyHeadGroup.rotation.y = Math.sin(time * 2.2) * 0.12;
        this.puppyHeadGroup.rotation.x = -0.12;
      }
      if (this.puppyTail) {
        this.puppyTail.rotation.y = Math.sin(time * 8) * 0.25;
      }

      this.puppyTimer -= delta;
      if (this.puppyTimer <= 0) {
        this.puppyGroup.rotation.x = 0;
        this.puppyState = 'walking';
        this.pickPuppyTarget();
      }

    } else {
      // Idle state
      this.puppyGroup.rotation.x = THREE.MathUtils.lerp(this.puppyGroup.rotation.x, 0, 0.1);
      if (this.puppyHeadGroup) {
        this.puppyHeadGroup.rotation.y = Math.sin(time * 2.5) * 0.18;
        this.puppyHeadGroup.rotation.z = Math.sin(time * 1.5) * 0.08;
      }
      if (this.puppyTail) {
        this.puppyTail.rotation.y = Math.sin(time * 5) * 0.22;
      }

      this.puppyTimer -= delta;
      if (this.puppyTimer <= 0) {
        this.puppyState = 'walking';
        this.pickPuppyTarget();
      }
    }
  }

  private pickPuppyTarget() {
    // Pick random target within enclosed room floor boundaries
    const rx = (Math.random() - 0.5) * 7.5;
    const rz = (Math.random() - 0.5) * 5.0 + 0.6;
    this.puppyTargetPos.set(rx, 0, rz);
  }

  public setCharacter(game: EsportsGameId) {
    if (this.character) {
      this.character.setCharacter(game);
    }
  }

  public setEnvironmentPalette(accent: string, highlight: string, tertiary: string, surface: string) {
    this.themePalette = { accent, highlight, tertiary, surface };
    this.keyboardWaveColor = null;
    this.themeMaterials.forEach(({ material, role, emissive }) => {
      const color = this.themePalette[role];
      material.color.set(color);
      if (emissive) material.emissive.set(color);
    });

    this.bookshelfMaterial.map?.dispose();
    this.bookshelfMaterial.map = createBookshelfTexture(accent, highlight, tertiary);
    this.bookshelfMaterial.needsUpdate = true;

    this.chairUpholsteryMaterial.map?.dispose();
    this.chairUpholsteryMaterial.map = createBurgundyWoolTexture(accent, highlight, tertiary);
    this.chairUpholsteryMaterial.needsUpdate = true;

    this.deskPadMaterial.map?.dispose();
    this.deskPadMaterial.map = createBurgundyWoolTexture(accent, highlight, tertiary);
    this.deskPadMaterial.needsUpdate = true;

    if (this.rugMaterial) {
      this.rugMaterial.map?.dispose();
      this.rugMaterial.map = createBurgundyWoolTexture(accent, highlight, tertiary);
      this.rugMaterial.needsUpdate = true;
    }

    if (this.posterMaterial) {
      this.posterMaterial.map?.dispose();
      this.posterMaterial.map = createEsportsPosterTexture(accent, highlight, tertiary);
      this.posterMaterial.needsUpdate = true;
    }

    if (this.paintingMaterial) {
      this.paintingMaterial.map?.dispose();
      this.paintingMaterial.map = createPaintingTexture(accent, highlight, tertiary);
      this.paintingMaterial.needsUpdate = true;
    }

    this.character?.setPedestalPalette(accent, highlight, surface);
    this.renderer.render(this.scene, this.camera);
  }

  public getActiveCharacter(): EsportsGameId {
    return this.character ? this.character.activeGame : 'valorant';
  }

  public setPlayerGamerTag(tag: string) {
    this.activePlayerTag = tag;
    this.drawMonitorScreen(0);
  }

  public toggleRoomLights() {
    this.ambientLight.visible = !this.ambientLight.visible;
    this.mauveSpotLight.visible = !this.mauveSpotLight.visible;
    this.plumFillLight.visible = !this.plumFillLight.visible;
    this.rimLight.visible = !this.rimLight.visible;
  }

  public destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    if (this.animFrameId !== null) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;
    this.removeEventListeners?.();
    this.removeEventListeners = null;
    this.flushPendingPointerMove = null;
    this.hasPendingPointerMove = false;
    this.devPerfObserver?.disconnect();
    this.devPerfObserver = null;

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      const objectMaterials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const material of objectMaterials) {
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    });
    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
    geometries.forEach((geometry) => geometry.dispose());
    if (this.character) this.character.destroy();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
