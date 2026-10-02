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
    const tones = ['#b88248', '#a9753e', '#9c6a37', '#be894e', '#8f5f2e'];
    for (let y = 0; y < 32; y += 2) {
      for (let x = 0; x < 32; x += 2) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Horizontal Plank Seams
    ctx.fillStyle = '#65421d';
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
export function createBookshelfTexture(): THREE.CanvasTexture {
  return createMinecraftPixelTexture(32, 32, (ctx) => {
    // Oak Wood Frame
    ctx.fillStyle = '#9c6a37';
    ctx.fillRect(0, 0, 32, 32);

    // Book Spines row 1 (y: 4 to 14)
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(2, 3, 28, 11);

    const bookColors = ['#9e2b25', '#2b5f9e', '#3b7d3b', '#c29b38', '#6a2b82', '#9e5a2b'];
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
    const tones = ['#696969', '#787878', '#5b5b5b', '#626262', '#828282'];
    for (let y = 0; y < 32; y += 2) {
      for (let x = 0; x < 32; x += 2) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
    // Mortar lines
    ctx.fillStyle = '#393939';
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
export function createBurgundyWoolTexture(): THREE.CanvasTexture {
  return createMinecraftPixelTexture(16, 16, (ctx) => {
    const tones = ['#5a1836', '#721c47', '#8a2355', '#a62b5f', '#441128'];
    for (let y = 0; y < 16; y += 2) {
      for (let x = 0; x < 16; x += 2) {
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    }
  });
}

