/*!
 * Copyright 2026 Cognite AS
 */

import { composeDigitAtlas, CLUSTER_DIGIT_SVGS, createClusterSpriteTextures } from './clusterSpriteTextures';
import { CLUSTER_DIGIT_CELL_SIZE, CLUSTER_DIGIT_GLYPHS, createDigitAtlasCanvas } from './clusterDigitAtlas';

describe(createClusterSpriteTextures.name, () => {
  test('creates ring, hover, and digit atlas textures without flipping Y', () => {
    const textures = createClusterSpriteTextures({
      loadSvgImage: async () => document.createElement('canvas')
    });

    expect(textures.ring.flipY).toBe(false);
    expect(textures.ringHover.flipY).toBe(false);
    expect(textures.digitAtlas.flipY).toBe(false);

    textures.ring.dispose();
    textures.ringHover.dispose();
    textures.digitAtlas.dispose();
  });
});

describe(composeDigitAtlas.name, () => {
  test('draws each digit SVG into its atlas cell', async () => {
    const drawn: Array<{ index: number; x: number; y: number }> = [];
    const canvas = createDigitAtlasCanvas();
    const images = CLUSTER_DIGIT_GLYPHS.map(() => document.createElement('canvas'));

    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (this: CanvasRenderingContext2D, ...args: unknown[]) {
      const x = args[1] as number;
      const y = args[2] as number;
      drawn.push({ index: drawn.length, x, y });
      return originalDrawImage.apply(this, args as Parameters<typeof originalDrawImage>);
    };

    try {
      await composeDigitAtlas(canvas, {
        loadSvgImage: async svg => images[CLUSTER_DIGIT_SVGS.indexOf(svg)]
      });
    } finally {
      CanvasRenderingContext2D.prototype.drawImage = originalDrawImage;
    }

    expect(drawn).toHaveLength(CLUSTER_DIGIT_GLYPHS.length);
    expect(drawn[0]).toEqual({ index: 0, x: 0, y: 0 });
    expect(drawn[4]).toEqual({ index: 4, x: 0, y: CLUSTER_DIGIT_CELL_SIZE });
  });
});
