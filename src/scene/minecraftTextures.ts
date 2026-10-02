import * as THREE from 'three';

/**
 * Creates a pixelated Minecraft CanvasTexture with NearestFilter
 */
export function createMinecraftPixelTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  repeatX = 1,
  repeatY = 1
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
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

/**
 * Minecraft Oak Planks Wood Texture (32x32)
 */
export function createOakPlanksTexture(repeatX = 2, repeatY = 2): THREE.CanvasTexture {
  return createMinecraftPixelTexture(32, 32, (ctx) => {
    const tones = ['#30343a', '#282d33', '#353a41', '#24292f', '#1d2228'];
    for (let y = 0; y < 32; y += 2) {
      for (let x = 0; x < 32; x += 2) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Horizontal Plank Seams
    ctx.fillStyle = '#171b20';
    ctx.fillRect(0, 7, 32, 2);
    ctx.fillRect(0, 15, 32, 2);
    ctx.fillRect(0, 23, 32, 2);
    ctx.fillRect(0, 31, 32, 2);

    // Vertical Joint Gaps
    ctx.fillRect(14, 0, 2, 8);
    ctx.fillRect(24, 8, 2, 8);
    ctx.fillRect(8, 16, 2, 8);
    ctx.fillRect(20, 24, 2, 8);
  }, repeatX, repeatY);
}

/**
 * Minecraft Bookshelf Texture (32x32)
 */
export function createBookshelfTexture(
  accent = '#9e2b25',
  highlight = '#2b5f9e',
  tertiary = '#3b7d3b'
): THREE.CanvasTexture {
  return createMinecraftPixelTexture(32, 32, (ctx) => {
    // Oak Wood Frame
    ctx.fillStyle = '#9c6a37';
    ctx.fillRect(0, 0, 32, 32);

    // Book Spines row 1 (y: 4 to 14)
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(2, 3, 28, 11);

    const bookColors = [accent, highlight, tertiary, accent, highlight, tertiary];
    for (let x = 3; x < 29; x += 3) {
      ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
      ctx.fillRect(x, 4, 2, 9);
      // Gold bookmark / book page edge
      ctx.fillStyle = '#dfd8ba';
      ctx.fillRect(x, 4, 2, 2);
    }

    // Book Spines row 2 (y: 18 to 28)
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(2, 17, 28, 11);

    for (let x = 3; x < 29; x += 3) {
      ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
      ctx.fillRect(x, 18, 2, 9);
      ctx.fillStyle = '#dfd8ba';
      ctx.fillRect(x, 18, 2, 2);
    }

    // Wood center shelf divider
    ctx.fillStyle = '#7a5127';
    ctx.fillRect(0, 14, 32, 3);
    ctx.fillRect(0, 0, 32, 3);
    ctx.fillRect(0, 29, 32, 3);
  });
}

/**
 * Minecraft Stone Bricks Texture (32x32)
 */
export function createStoneBricksTexture(repeatX = 2, repeatY = 2): THREE.CanvasTexture {
  return createMinecraftPixelTexture(32, 32, (ctx) => {
    const tones = ['#343941', '#2d3239', '#262b32', '#30353c', '#3b4149'];
    for (let y = 0; y < 32; y += 2) {
      for (let x = 0; x < 32; x += 2) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Mortar lines
    ctx.fillStyle = '#191d23';
    ctx.fillRect(0, 15, 32, 2);
    ctx.fillRect(0, 31, 32, 2);
    ctx.fillRect(15, 0, 2, 16);
    ctx.fillRect(31, 16, 2, 16);
  }, repeatX, repeatY);
}

/**
 * Minecraft Red Wool Texture (16x16)
 */
export function createRedWoolTexture(): THREE.CanvasTexture {
  return createMinecraftPixelTexture(16, 16, (ctx) => {
    const tones = ['#a61c1c', '#b82323', '#8f1717', '#c92c2c', '#7d1313'];
    for (let y = 0; y < 16; y += 2) {
      for (let x = 0; x < 16; x += 2) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
  });
}

/**
 * Minecraft Burgundy / Mauve Wool Texture (16x16) - Brand Palette
 */
export function createBurgundyWoolTexture(
  accent = '#a62b5f',
  highlight = '#721c47',
  tertiary = '#441128'
): THREE.CanvasTexture {
  return createMinecraftPixelTexture(16, 16, (ctx) => {
    const tones = [tertiary, highlight, accent, accent, tertiary];
    for (let y = 0; y < 16; y += 2) {
      for (let x = 0; x < 16; x += 2) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
  });
}

/**
 * Minecraft Crafting Table Top Texture (32x32)
 */
export function createCraftingTableTopTexture(): THREE.CanvasTexture {
  return createMinecraftPixelTexture(32, 32, (ctx) => {
    // Oak wood base
    ctx.fillStyle = '#8f5c32';
    ctx.fillRect(0, 0, 32, 32);

    // Dark wood border
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(0, 0, 32, 3);
    ctx.fillRect(0, 29, 32, 3);
    ctx.fillRect(0, 0, 3, 32);
    ctx.fillRect(29, 0, 3, 32);

    // 3x3 Grid Lines
    ctx.fillStyle = '#3a2312';
    ctx.fillRect(11, 3, 2, 26);
    ctx.fillRect(19, 3, 2, 26);
    ctx.fillRect(3, 11, 26, 2);
    ctx.fillRect(3, 19, 26, 2);

    // Mini Hammer & Saw pixel icons
    ctx.fillStyle = '#d0c8b0';
    ctx.fillRect(5, 5, 4, 4); // Iron hammer head
    ctx.fillStyle = '#b08040';
    ctx.fillRect(21, 21, 5, 5); // Saw handle
  });
}

/**
 * Minecraft Furnace Front Texture (32x32)
 */
export function createFurnaceFrontTexture(): THREE.CanvasTexture {
  return createMinecraftPixelTexture(32, 32, (ctx) => {
    // Stone base
    const tones = ['#4a4e54', '#3d4147', '#565a62', '#33363b'];
    for (let y = 0; y < 32; y += 2) {
      for (let x = 0; x < 32; x += 2) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Furnace Arch Opening (y: 10 to 26)
    ctx.fillStyle = '#17181c';
    ctx.fillRect(6, 10, 20, 16);

    // Glowing Coal Fire Glow inside
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(8, 14, 16, 10);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(10, 16, 12, 6);
    ctx.fillStyle = '#ffffaa';
    ctx.fillRect(13, 18, 6, 3);
  });
}

/**
 * Minecraft Chest Front Texture (32x32)
 */
export function createChestFrontTexture(): THREE.CanvasTexture {
  return createMinecraftPixelTexture(32, 32, (ctx) => {
    // Dark Oak Wood face
    ctx.fillStyle = '#734722';
    ctx.fillRect(0, 0, 32, 32);

    // Iron Banding Edge Frame
    ctx.fillStyle = '#2b231b';
    ctx.fillRect(0, 0, 32, 3);
    ctx.fillRect(0, 29, 32, 3);
    ctx.fillRect(0, 0, 3, 32);
    ctx.fillRect(29, 0, 3, 32);

    // Lid Seam
    ctx.fillStyle = '#1e1610';
    ctx.fillRect(0, 14, 32, 3);

    // Silver / Gold Lock Clasp
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(13, 12, 6, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 13, 2, 3);
  });
}

/**
 * Minecraft Wall Painting (64x64 Pixel Art: Motivational Poster)
 */
export function createPaintingTexture(
  accent = '#a62b5f',
  highlight = '#e66a3a',
  tertiary = '#3a102c'
): THREE.CanvasTexture {
  return createMinecraftPixelTexture(64, 64, (ctx) => {
    // Frame
    ctx.fillStyle = '#1c1920';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#0f0c16';
    ctx.fillRect(2, 2, 60, 60);

    // Canvas Background
    ctx.fillStyle = tertiary;
    ctx.fillRect(4, 4, 56, 56);
    
    // Diagonal Ray
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(32, 60);
    ctx.lineTo(4, 60);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Motivational Text
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('GRIND', 32, 24);

    ctx.font = '8px monospace';
    ctx.fillStyle = highlight;
    ctx.fillText('NEVER STOPS', 32, 42);

    // Accent line
    ctx.fillStyle = accent;
    ctx.fillRect(16, 50, 32, 2);
  });
}

/**
 * Evoke Esports Champions Poster Texture (128x128) - Dynamic Theme Palette
 */
export function createEsportsPosterTexture(
  accent = '#a62b5f',
  highlight = '#e66a3a',
  tertiary = '#3a102c'
): THREE.CanvasTexture {
  return createMinecraftPixelTexture(128, 128, (ctx) => {
    // Outer Metallic Highlight Frame
    ctx.fillStyle = '#1c1920';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = highlight;
    ctx.fillRect(3, 3, 122, 122);
    ctx.fillStyle = '#0f0c16';
    ctx.fillRect(6, 6, 116, 116);

    // Dynamic Mauve & Burnt Orange Backdrop
    ctx.fillStyle = tertiary;
    ctx.fillRect(8, 8, 112, 112);
    ctx.fillStyle = accent;
    ctx.fillRect(8, 36, 112, 50);

    // Diagonal Speed Rays
    ctx.fillStyle = highlight;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(64, 64);
    ctx.lineTo(8, 64);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(120, 8);
    ctx.lineTo(64, 64);
    ctx.lineTo(120, 64);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Radiant Diamond Crest Emblem
    ctx.fillStyle = '#55ffff';
    ctx.beginPath();
    ctx.moveTo(64, 24);
    ctx.lineTo(88, 48);
    ctx.lineTo(64, 72);
    ctx.lineTo(40, 48);
    ctx.closePath();
    ctx.fill();

    // Inner Crest Core
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.moveTo(64, 32);
    ctx.lineTo(78, 48);
    ctx.lineTo(64, 64);
    ctx.lineTo(50, 48);
    ctx.closePath();
    ctx.fill();

    // Header Text: "EVOKE // RADIANT"
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('EVOKE // RADIANT', 64, 92);

    // Subtext: "CHAMPIONS"
    ctx.font = '900 11px monospace';
    ctx.fillStyle = highlight;
    ctx.fillText('✦ CHAMPIONS ✦', 64, 110);
  });
}



