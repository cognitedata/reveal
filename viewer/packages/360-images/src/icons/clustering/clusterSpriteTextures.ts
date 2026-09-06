/*!
 * Copyright 2026 Cognite AS
 */

import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  type Texture,
  TextureLoader
} from 'three';
import clusterRingSvg from './assets/cluster-ring.svg?raw';
import clusterRingHoverSvg from './assets/cluster-ring-hover.svg?raw';
import digit0 from './assets/digits/digit-0.svg?raw';
import digit1 from './assets/digits/digit-1.svg?raw';
import digit2 from './assets/digits/digit-2.svg?raw';
import digit3 from './assets/digits/digit-3.svg?raw';
import digit4 from './assets/digits/digit-4.svg?raw';
import digit5 from './assets/digits/digit-5.svg?raw';
import digit6 from './assets/digits/digit-6.svg?raw';
import digit7 from './assets/digits/digit-7.svg?raw';
import digit8 from './assets/digits/digit-8.svg?raw';
import digit9 from './assets/digits/digit-9.svg?raw';
import digitPlus from './assets/digits/digit-plus.svg?raw';
import {
  atlasCellOrigin,
  CLUSTER_DIGIT_CELL_SIZE,
  CLUSTER_DIGIT_GLYPHS,
  createDigitAtlasCanvas
} from './clusterDigitAtlas';

export type ClusterSpriteTextures = {
  ring: Texture;
  ringHover: Texture;
  digitAtlas: Texture;
};

export type ClusterSpriteTexturesDeps = {
  loadSvgImage: (svg: string) => Promise<CanvasImageSource>;
};

export const CLUSTER_DIGIT_SVGS: readonly string[] = [
  digit0,
  digit1,
  digit2,
  digit3,
  digit4,
  digit5,
  digit6,
  digit7,
  digit8,
  digit9,
  digitPlus
];

export const defaultClusterSpriteTexturesDeps: ClusterSpriteTexturesDeps = {
  loadSvgImage: loadSvgImage
};

const TextureLoaderInstance = new TextureLoader();

/**
 * Loads the concentric-ring sprites and stitches the 0-9 / plus SVGs into one atlas.
 * Rasterizing each vector digit at 256px keeps counts sharp at the 48-120px cluster sizes.
 */
export function createClusterSpriteTextures(
  deps: ClusterSpriteTexturesDeps = defaultClusterSpriteTexturesDeps
): ClusterSpriteTextures {
  const ring = loadSvgTexture(clusterRingSvg);
  const ringHover = loadSvgTexture(clusterRingHoverSvg);
  const digitAtlas = createDigitAtlasTexture(deps);

  return { ring, ringHover, digitAtlas };
}

function loadSvgTexture(svg: string): Texture {
  const texture = TextureLoaderInstance.load(svgToDataUrl(svg));
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createDigitAtlasTexture(deps: ClusterSpriteTexturesDeps): Texture {
  const canvas = createDigitAtlasCanvas();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;

  void composeDigitAtlas(canvas, deps)
    .then(() => {
      texture.needsUpdate = true;
    })
    .catch(() => {
      // Tests and environments without SVG image decode keep an empty atlas.
    });

  return texture;
}

export async function composeDigitAtlas(
  canvas: HTMLCanvasElement,
  deps: ClusterSpriteTexturesDeps = defaultClusterSpriteTexturesDeps
): Promise<void> {
  const context = canvas.getContext('2d');
  if (context === null) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  const images = await Promise.all(CLUSTER_DIGIT_SVGS.map(svg => deps.loadSvgImage(svg)));

  for (let index = 0; index < CLUSTER_DIGIT_GLYPHS.length; index++) {
    const origin = atlasCellOrigin(index);
    context.drawImage(images[index], origin.x, origin.y, CLUSTER_DIGIT_CELL_SIZE, CLUSTER_DIGIT_CELL_SIZE);
  }
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadSvgImage(svg: string): Promise<CanvasImageSource> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to decode cluster digit SVG'));
    image.src = svgToDataUrl(svg);
  });
}
