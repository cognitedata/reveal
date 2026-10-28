/*!
 * Copyright 2026 Cognite AS
 */

/**
 * These factors are used for undoing the `packDepthToRGBA` GLSL operation defined by ThreeJS.
 * They are taken from https://github.com/WestLangley/three.js/blob/bc58fecba18150103b95fbde5aaa3cc7cddf95a7/src/renderers/shaders/ShaderChunk/packing.glsl.js#L19
 */
const UNPACK_FACTORS = [255 / 256, 255 / 256 / 256, 255 / 256 / (256 * 256), 1 / (256 * 256 * 256)] as const;

export type CadPickBufferHit = {
  // Index of the model in the combined pick pass
  modelIndex: number;
  treeIndex: number;
  // Non-linear depth in [0, 1] as written by the depth render mode.
  depth: number;
};

// Full-frame CPU copy of a combined CAD tree index pass and depth pass, where all models were
// rendered together so every pixel holds the hit closest to the camera.
export class CadPickBuffer {
  readonly width: number;
  readonly height: number;

  // RGBA tree index output (RGB = tree index, A = model index + 1, or 0 when nothing was rendered).
  readonly treeIndexPixels: Uint8Array;
  // RGBA packed depth output.
  readonly depthPixels: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.treeIndexPixels = new Uint8Array(4 * width * height);
    this.depthPixels = new Uint8Array(4 * width * height);
  }

  // Returns the model index encoded in the alpha byte or undefined when no model was rendered.
  static decodeModelIndex(pixels: Uint8Array, offset: number): number | undefined {
    const alpha = pixels[offset + 3];
    return alpha === 0 ? undefined : alpha - 1;
  }

  static decodeTreeIndex(pixels: Uint8Array, offset: number): number {
    return pixels[offset] * 255 * 255 + pixels[offset + 1] * 255 + pixels[offset + 2];
  }

  static unpackDepth(pixels: Uint8Array, offset: number): number {
    return (
      (pixels[offset] * UNPACK_FACTORS[0] +
        pixels[offset + 1] * UNPACK_FACTORS[1] +
        pixels[offset + 2] * UNPACK_FACTORS[2] +
        pixels[offset + 3] * UNPACK_FACTORS[3]) /
      255
    );
  }

  // Returns the closest hit at the given normalized device coordinates or undefined.
  getHit(normalizedCoords: { x: number; y: number }): CadPickBufferHit | undefined {
    const x = Math.min(this.width - 1, Math.max(0, Math.floor(((normalizedCoords.x + 1) / 2) * this.width)));
    const y = Math.min(this.height - 1, Math.max(0, Math.floor(((normalizedCoords.y + 1) / 2) * this.height)));
    const offset = 4 * (x + y * this.width);

    const modelIndex = CadPickBuffer.decodeModelIndex(this.treeIndexPixels, offset);
    if (modelIndex === undefined) {
      return undefined;
    }
    return {
      modelIndex,
      treeIndex: CadPickBuffer.decodeTreeIndex(this.treeIndexPixels, offset),
      depth: CadPickBuffer.unpackDepth(this.depthPixels, offset)
    };
  }
}
