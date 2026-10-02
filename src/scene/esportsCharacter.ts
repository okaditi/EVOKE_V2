import * as THREE from 'three';
import { EsportsGameId } from '../types';

// ========================================================
// MINECRAFT PIXEL ART TEXTURE GENERATORS (Nearest-Neighbor)
// ========================================================

function createPixelTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  draw(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

/**
 * Valorant Duelist Face Pixel Texture (Jett aesthetic)
 */
function createValorantFaceTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx) => {
    // Light porcelain skin base
    ctx.fillStyle = '#f2d6c4';
    ctx.fillRect(0, 0, 32, 32);

    // Subtle skin contour & shadow
    ctx.fillStyle = '#e4beaa';
    ctx.fillRect(0, 24, 32, 8);
    ctx.fillRect(0, 0, 4, 32);
    ctx.fillRect(28, 0, 4, 32);

    // Sharp Duelist Eyes with Radiant Teal Pupils & Black Eyeliner
    // Sclera
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 13, 7, 5);
    ctx.fillRect(19, 13, 7, 5);

    // Eyeliner / Wing
    ctx.fillStyle = '#110d14';
    ctx.fillRect(5, 12, 9, 2);
    ctx.fillRect(18, 12, 9, 2);
    ctx.fillRect(4, 13, 2, 2);
    ctx.fillRect(26, 13, 2, 2);

    // Radiant Teal Irises
    ctx.fillStyle = '#55ffff';
    ctx.fillRect(8, 14, 4, 4);
    ctx.fillRect(20, 14, 4, 4);
    ctx.fillStyle = '#00aaaa';
    ctx.fillRect(10, 15, 2, 3);
    ctx.fillRect(22, 15, 2, 3);

    // Eyebrows
    ctx.fillStyle = '#3a323f';
    ctx.fillRect(7, 10, 7, 2);
    ctx.fillRect(18, 10, 7, 2);

    // Cute nose & lips
    ctx.fillStyle = '#d39e88';
    ctx.fillRect(15, 19, 2, 2);
    ctx.fillStyle = '#c76b77';
    ctx.fillRect(13, 23, 6, 2);

    // Radiant Cheek Mark (Wind swirl cyan glow)
    ctx.fillStyle = '#55ffff';
    ctx.fillRect(5, 18, 3, 2);
    ctx.fillRect(24, 18, 3, 2);
  });
}

/**
 * Valorant Tactical Duelist Wind Jacket Texture (Burgundy & Charcoal Palette)
 */
function createValorantJacketTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx) => {
    // Deep Charcoal Tactical Base
    ctx.fillStyle = '#17151a';
    ctx.fillRect(0, 0, 32, 32);

    // Burgundy / Mauve Tactical Trim Panels (#A62B5F)
    ctx.fillStyle = '#A62B5F';
    ctx.fillRect(0, 0, 32, 4);
    ctx.fillRect(0, 26, 32, 6);
    ctx.fillRect(14, 4, 4, 22); // Center zip line

    // Burnt Orange Hardware Specular Accents (#E66A3A)
    ctx.fillStyle = '#E66A3A';
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillRect(22, 6, 4, 4);
    ctx.fillRect(15, 8, 2, 4); // Zip puller

    // Radiant Wind Emblem / Cyan Shards
    ctx.fillStyle = '#55ffff';
    ctx.fillRect(8, 14, 4, 2);
    ctx.fillRect(20, 14, 4, 2);
    ctx.fillRect(10, 16, 2, 4);
    ctx.fillRect(20, 16, 2, 4);
  });
}

/**
 * Frosted Silver Duelist Hair Pixel Texture
 */
function createSilverHairTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx) => {
    const silverColors = ['#f4f3f6', '#dedce4', '#cbc8d6', '#ecebf2', '#b8b4c7'];
    for (let y = 0; y < 32; y += 2) {
      for (let x = 0; x < 32; x += 2) {
        ctx.fillStyle = silverColors[Math.floor(Math.random() * silverColors.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Highlighting gradient
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(0, 0, 32, 6);
  });
}

/**
 * Obsidian Pedestal Block Texture with Burgundy Veins
 */
function createBurgundyObsidianTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx) => {
    const baseColors = ['#100c14', '#150f1b', '#1a1024', '#22112d', '#0d0811'];
    for (let y = 0; y < 32; y += 2) {
      for (let x = 0; x < 32; x += 2) {
        ctx.fillStyle = baseColors[Math.floor(Math.random() * baseColors.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Deep Burgundy & Mauve Radiant crystal veins (#A62B5F & #E66A3A)
    ctx.fillStyle = '#A62B5F';
    ctx.fillRect(6, 8, 4, 2);
    ctx.fillRect(18, 16, 6, 2);
    ctx.fillRect(10, 24, 4, 2);
    ctx.fillStyle = '#E66A3A';
    ctx.fillRect(8, 10, 2, 2);
    ctx.fillRect(20, 18, 2, 2);
  });
}

export class Esports3DCharacter {
  public root: THREE.Group;
  public activeGame: EsportsGameId = 'valorant';

  // Minecraft Voxel Hierarchy
  private bodyRoot: THREE.Group;
  private hips: THREE.Group;
  private torso: THREE.Group;
  private head: THREE.Group;
  private hairPonytail: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;

  // Valorant Signature Weapons
  private kunaiBladeGroup: THREE.Group | null = null;
  private slungVandalGroup: THREE.Group | null = null;

  // Pedestal & Orbiting Radianite Crystals
  private pedestalGroup: THREE.Group;
  private radianiteGroup: THREE.Group;
  private badgeCanvas!: HTMLCanvasElement;
  private badgeCtx!: CanvasRenderingContext2D;
  private badgeTexture!: THREE.CanvasTexture;

  // Dedicated Burgundy Lighting
  private keyLight: THREE.SpotLight;
  private rimLight: THREE.DirectionalLight;
  private fillLight: THREE.PointLight;

  // Interactive meshes for clicking
  public interactiveMeshes: THREE.Object3D[] = [];

  // Animation states
  private breatheTime = 0;
  private isInspecting = false;
  private inspectProgress = 0;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.root = new THREE.Group();
    this.root.position.copy(position);

    // 1. Pedestal Group (Base)
    this.pedestalGroup = new THREE.Group();
    this.radianiteGroup = new THREE.Group();
    this.root.add(this.pedestalGroup);
    this.pedestalGroup.add(this.radianiteGroup);

    this.buildValorantPedestal();

    // 2. Voxel Character Root
    this.bodyRoot = new THREE.Group();
    this.bodyRoot.position.set(0, 0, 0);
    this.root.add(this.bodyRoot);

    // 3. Build Skeleton & Valorant Agent Model
    this.hips = new THREE.Group();
    this.torso = new THREE.Group();
    this.head = new THREE.Group();
    this.hairPonytail = new THREE.Group();
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();

    this.buildValorantAgentVoxelModel();

    // 4. Dedicated Burgundy & Mauve Studio Lighting
    // Mauve / Burgundy Key Spotlight
    this.keyLight = new THREE.SpotLight(0xa62b5f, 4.2);
    this.keyLight.position.set(-1.0, 3.2, 1.9);
    this.keyLight.target.position.set(-1.42, 1.25, 0.12);
    this.keyLight.angle = Math.PI / 4.0;
    this.keyLight.penumbra = 0.6;
    this.keyLight.castShadow = true;
    scene.add(this.keyLight);
    scene.add(this.keyLight.target);

    // Burnt Orange Rim Specular Glint Light
    this.rimLight = new THREE.DirectionalLight(0xe66a3a, 2.6);
    this.rimLight.position.set(-3.6, 2.8, -1.4);
    scene.add(this.rimLight);

    // Plum Ambient Filler
    this.fillLight = new THREE.PointLight(0x3a102c, 2.6, 5.0);
    this.fillLight.position.set(-2.2, 0.6, 1.2);
    scene.add(this.fillLight);

    // Add root to scene
    scene.add(this.root);

    // Set initial character
    this.setCharacter('valorant', true);
  }

  // ========================================================
  // 1. MINECRAFT OBSIDIAN & BURGUNDY RADIANITE PEDESTAL
  // ========================================================
  private buildValorantPedestal() {
    const obsidianTex = createBurgundyObsidianTexture();
    const obsidianMat = new THREE.MeshStandardMaterial({
      map: obsidianTex,
      roughness: 0.35,
      metalness: 0.7,
    });

    // 1. Blocky Obsidian Base (Voxel slab)
    const baseGeo = new THREE.BoxGeometry(0.88, 0.16, 0.88);
    const base = new THREE.Mesh(baseGeo, obsidianMat);
    base.position.set(0, 0.08, 0);
    base.receiveShadow = true;
    this.pedestalGroup.add(base);

    // 2. Burgundy & Gold Corner Rivets (Voxel cubes)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.9,
      roughness: 0.2,
    });
    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const rivet = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), goldMat);
        rivet.position.set(x * 0.40, 0.18, z * 0.40);
        this.pedestalGroup.add(rivet);
      }
    }

    // 3. Floating Radianite Energy Crystals & Wind Shards
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x55ffff,
      emissive: 0x00aaaa,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const mauveShardMat = new THREE.MeshStandardMaterial({
      color: 0xa62b5f,
      emissive: 0x721c47,
      emissiveIntensity: 0.7,
    });

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const radius = 0.50 + (i % 2) * 0.06;
      const isMauve = i % 2 === 0;
      const shard = new THREE.Mesh(
        new THREE.BoxGeometry(0.038, 0.08, 0.038),
        isMauve ? mauveShardMat : crystalMat
      );
      shard.position.set(
        Math.cos(angle) * radius,
        0.26 + 0.06 * Math.sin(i * 1.4),
        Math.sin(angle) * radius
      );
      shard.rotation.y = angle + 0.4;
      shard.rotation.z = 0.2;
      this.radianiteGroup.add(shard);
    }

    // 4. Pixelated Holographic Minecrafty Nameplate
    this.badgeCanvas = document.createElement('canvas');
    this.badgeCanvas.width = 512;
    this.badgeCanvas.height = 160;
    this.badgeCtx = this.badgeCanvas.getContext('2d')!;
    this.badgeTexture = new THREE.CanvasTexture(this.badgeCanvas);
    this.badgeTexture.magFilter = THREE.NearestFilter;
    this.badgeTexture.minFilter = THREE.NearestFilter;

    const badgePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.74, 0.24),
      new THREE.MeshBasicMaterial({
        map: this.badgeTexture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      })
    );
    badgePlane.rotation.x = -Math.PI / 2.3;
    badgePlane.position.set(0, 0.17, 0.45);
    this.pedestalGroup.add(badgePlane);

    this.updateHoloBadge();
  }

  private updateHoloBadge() {
    const ctx = this.badgeCtx;
    ctx.clearRect(0, 0, 512, 160);

    // Burgundy / Charcoal Dark Tooltip Box
    ctx.fillStyle = 'rgba(23, 20, 28, 0.94)';
    ctx.fillRect(0, 0, 512, 160);

    // Double Pixel Border in Burgundy (#A62B5F) and Burnt Orange (#E66A3A)
    ctx.strokeStyle = '#A62B5F';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 148);

    ctx.strokeStyle = '#E66A3A';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 488, 136);

    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#F4F0EA';
    ctx.textAlign = 'center';

    const title =
      this.activeGame === 'valorant'
        ? '✦ VALORANT // RADIANT JETT ✦'
        : this.activeGame === 'cod'
        ? '✦ VALORANT // DUELIST LEAD ✦'
        : '✦ VALORANT // VCT RADIANT ✦';

    ctx.fillText(title, 256, 58);

    ctx.font = 'bold 17px monospace';
    ctx.fillStyle = '#A62B5F';
    const sub =
      this.activeGame === 'valorant'
        ? 'BLADE STORM • TAILWIND • RADIANT #1'
        : this.activeGame === 'cod'
        ? 'TACTICAL VANDAL • VCT MASTERS'
        : 'IMMORTAL 3 • 340 ACS DUELIST';

    ctx.fillText(sub, 256, 96);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#E66A3A';
    ctx.fillText('EVOKE // VALORANT PROTOCOL • 2026', 256, 130);

    this.badgeTexture.needsUpdate = true;
  }

  // ========================================================
  // 2. MINECRAFT VOXEL VALORANT PLAYER MODEL (JETT DUELIST)
  // ========================================================
  private buildValorantAgentVoxelModel() {
    const faceTex = createValorantFaceTexture();
    const jacketTex = createValorantJacketTexture();
    const hairTex = createSilverHairTexture();

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf2d6c4,
      roughness: 0.65,
      metalness: 0.05,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.5,
      metalness: 0.1,
    });
    const jacketMat = new THREE.MeshStandardMaterial({
      map: jacketTex,
      roughness: 0.6,
      metalness: 0.2,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      map: hairTex,
      roughness: 0.45,
      metalness: 0.1,
    });
    const tacticalDarkMat = new THREE.MeshStandardMaterial({
      color: 0x1b1922,
      roughness: 0.7,
      metalness: 0.25,
    });
    const burgundyMat = new THREE.MeshStandardMaterial({
      color: 0xa62b5f,
      roughness: 0.5,
      metalness: 0.3,
    });

    // 1. Hips (y = 0.96)
    this.hips.position.set(0, 0.96, 0);
    this.bodyRoot.add(this.hips);

    // 2. Torso (0.36m width, 0.54m height, 0.18m depth)
    this.torso.position.set(0, 0.27, 0);
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.54, 0.18), jacketMat);
    torsoMesh.castShadow = true;
    this.torso.add(torsoMesh);

    // Tactical High Upturned Collar (Valorant Windbreaker look)
    const collarBack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.04), burgundyMat);
    collarBack.position.set(0, 0.28, -0.09);
    const collarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.20), burgundyMat);
    collarLeft.position.set(-0.19, 0.28, 0);
    const collarRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.20), burgundyMat);
    collarRight.position.set(0.19, 0.28, 0);
    this.torso.add(collarBack, collarLeft, collarRight);

    // Slung Minecraft 3D Vandal Tactical Rifle on the back!
    this.slungVandalGroup = this.buildMinecraftVandal();
    this.slungVandalGroup.position.set(0.05, 0.05, -0.16);
    this.slungVandalGroup.rotation.z = 0.65;
    this.slungVandalGroup.rotation.y = Math.PI;
    this.torso.add(this.slungVandalGroup);

    this.hips.add(this.torso);

    // 3. Head (0.36m x 0.36m x 0.36m)
    this.head.position.set(0, 0.45, 0);

    // Head cube with face on front (+Z)
    const headMaterials = [
      hairMat, // Right
      hairMat, // Left
      hairMat, // Top
      skinMat, // Bottom
      faceMat, // Front
      hairMat, // Back
    ];
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), headMaterials);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // 3D Frosted Silver Hair Volume Layers (Side Bangs)
    const lBang = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.14), hairMat);
    lBang.position.set(-0.19, -0.02, 0.12);
    const rBang = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.14), hairMat);
    rBang.position.set(0.19, -0.02, 0.12);
    const frontFringe = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.06), hairMat);
    frontFringe.position.set(0, 0.16, 0.17);
    this.head.add(lBang, rBang, frontFringe);

    // High Valorant Ponytail that flows back & sways!
    this.hairPonytail.position.set(0, 0.18, -0.19);
    const tieMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), burgundyMat);
    const tailMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.32, 0.10), hairMat);
    tailMesh.position.set(0, -0.16, -0.06);
    tailMesh.rotation.x = -0.25;
    this.hairPonytail.add(tieMesh, tailMesh);
    this.head.add(this.hairPonytail);

    this.torso.add(this.head);

    // 4. Left Arm (0.18m x 0.54m x 0.18m)
    this.leftArm.position.set(-0.27, 0.18, 0);
    const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.54, 0.175), tacticalDarkMat);
    lArmMesh.position.set(0, -0.18, 0);
    lArmMesh.castShadow = true;

    // Burgundy arm band
    const lArmBand = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.08, 0.19), burgundyMat);
    lArmBand.position.set(0, -0.08, 0);
    this.leftArm.add(lArmMesh, lArmBand);
    this.torso.add(this.leftArm);

    // 5. Right Arm (Holding Radiant Kunai Dagger!)
    this.rightArm.position.set(0.27, 0.18, 0);
    const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.54, 0.175), tacticalDarkMat);
    rArmMesh.position.set(0, -0.18, 0);
    rArmMesh.castShadow = true;
    this.rightArm.add(rArmMesh);

    // Build Iconic Valorant Blade Storm / Wind Kunai in Right Hand!
    this.kunaiBladeGroup = this.buildValorantKunai();
    this.kunaiBladeGroup.position.set(0, -0.40, 0.14);
    this.kunaiBladeGroup.rotation.x = -Math.PI / 3.8;
    this.kunaiBladeGroup.rotation.z = -0.2;
    this.rightArm.add(this.kunaiBladeGroup);

    this.torso.add(this.rightArm);

    // 6. Left Leg (0.175m x 0.54m x 0.18m)
    this.leftLeg.position.set(-0.09, -0.27, 0);
    const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.54, 0.175), tacticalDarkMat);
    lLegMesh.position.set(0, -0.27, 0);
    lLegMesh.castShadow = true;

    // Burgundy Knee Guard
    const lKnee = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.10, 0.08), burgundyMat);
    lKnee.position.set(0, -0.25, 0.07);
    this.leftLeg.add(lLegMesh, lKnee);
    this.hips.add(this.leftLeg);

    // 7. Right Leg
    this.rightLeg.position.set(0.09, -0.27, 0);
    const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.54, 0.175), tacticalDarkMat);
    rLegMesh.position.set(0, -0.27, 0);
    rLegMesh.castShadow = true;

    const rKnee = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.10, 0.08), burgundyMat);
    rKnee.position.set(0, -0.25, 0.07);
    this.rightLeg.add(rLegMesh, rKnee);
    this.hips.add(this.rightLeg);

    // Register interactive click targets
    this.interactiveMeshes.push(headMesh, torsoMesh, lArmMesh, rArmMesh, lLegMesh, rLegMesh);
  }

  /**
   * Builds an iconic Valorant Radiant Wind Kunai (Blade Storm Dagger)
   */
  private buildValorantKunai(): THREE.Group {
    const kunai = new THREE.Group();

    // Radiant Cyan / White Luminous Blade Material
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x55ffff,
      roughness: 0.15,
      metalness: 0.8,
      emissive: 0x00aaaa,
      emissiveIntensity: 0.6,
    });
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
    });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x1f1a24, roughness: 0.6 });
    const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.9 });

    // Handle (Voxel rod)
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.14, 0.024), handleMat);
    handle.position.set(0, 0, 0);
    kunai.add(handle);

    // Gold Ring Pommel
    const ring = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.02), goldRingMat);
    ring.position.set(0, -0.09, 0);
    kunai.add(ring);

    // Crossguard collar
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.04), goldRingMat);
    collar.position.set(0, 0.07, 0);
    kunai.add(collar);

    // Leaf-shaped Stepped Radiant Kunai Blade
    const bladeBase = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.22, 0.016), bladeMat);
    bladeBase.position.set(0, 0.18, 0);
    bladeBase.castShadow = true;

    // Diamond Sharp Tip
    const bladeTip = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.10, 0.014), edgeMat);
    bladeTip.position.set(0, 0.32, 0);

    kunai.add(bladeBase, bladeTip);
    return kunai;
  }

  /**
   * Builds a voxel-crafted Valorant Vandal tactical rifle slung on the back
   */
  private buildMinecraftVandal(): THREE.Group {
    const rifle = new THREE.Group();

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1b1924,
      roughness: 0.5,
      metalness: 0.7,
    });
    const burgundyMat = new THREE.MeshStandardMaterial({
      color: 0xa62b5f,
      roughness: 0.4,
      metalness: 0.4,
    });
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x2d2b38,
      roughness: 0.3,
      metalness: 0.85,
    });

    // Receiver Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.38), chassisMat);
    body.position.set(0, 0, 0);

    // Burgundy Upper Rail & Shroud
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.36), burgundyMat);
    upper.position.set(0, 0.08, 0);

    // Ribbed Barrel & Muzzle
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.26), barrelMat);
    barrel.position.set(0, 0.04, 0.28);

    // Curved Banana Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, 0.08), chassisMat);
    mag.position.set(0, -0.12, 0.04);
    mag.rotation.x = 0.25;

    // Stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.10, 0.16), chassisMat);
    stock.position.set(0, -0.02, -0.24);

    rifle.add(body, upper, barrel, mag, stock);
    return rifle;
  }

  // ========================================================
  // CHARACTER SWITCHING (VALORANT AGENT ROSTER)
  // ========================================================
  public setCharacter(game: EsportsGameId, instant: boolean = false) {
    this.activeGame = game;
    this.updateHoloBadge();

    // Trigger subtle spin & burst
    if (!instant) {
      this.inspect();
    }
  }

  public inspect() {
    this.isInspecting = true;
    this.inspectProgress = 0;
  }

  public triggerInspect() {
    this.inspect();
  }

  // ========================================================
  // FRAME TICK & IDLE ANIMATION
  // ========================================================
  public update(
    time: number,
    delta: number,
    mouseNormX: number = 0,
    mouseNormY: number = 0
  ) {
    this.breatheTime += delta * 2.2;

    // 1. Subtle natural breathing bob
    const breathe = Math.sin(this.breatheTime) * 0.015;
    this.torso.position.y = 0.27 + breathe;
    this.leftArm.rotation.x = Math.sin(this.breatheTime * 0.8) * 0.05;

    // 2. Ponytail wind sway (Valorant wind duelist signature)
    const windFloat = Math.sin(this.breatheTime * 1.6) * 0.12;
    this.hairPonytail.rotation.x = -0.1 + windFloat;
    this.hairPonytail.rotation.y = Math.cos(this.breatheTime * 1.2) * 0.08;

    // 3. Right arm with Kunai blade hover
    this.rightArm.rotation.x = -0.15 + Math.cos(this.breatheTime) * 0.04;
    if (this.kunaiBladeGroup) {
      this.kunaiBladeGroup.rotation.y = Math.sin(time * 2.0) * 0.15;
    }

    // 4. Orbiting Radianite energy crystals
    this.radianiteGroup.rotation.y += delta * 0.85;

    // 5. Head tracks user cursor subtly
    const targetHeadY = mouseNormX * 0.35;
    const targetHeadX = -mouseNormY * 0.25;
    this.head.rotation.y += (targetHeadY - this.head.rotation.y) * 0.08;
    this.head.rotation.x += (targetHeadX - this.head.rotation.x) * 0.08;

    // 6. Inspect mode spin flourish
    if (this.isInspecting) {
      this.inspectProgress += delta * 2.5;
      if (this.inspectProgress < 1) {
        this.bodyRoot.rotation.y = Math.sin(this.inspectProgress * Math.PI) * Math.PI * 0.4;
      } else {
        this.bodyRoot.rotation.y = 0;
        this.isInspecting = false;
      }
    }
  }

  public destroy() {
    this.badgeCanvas.remove();
    this.root.clear();
  }
}
