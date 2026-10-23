/*!
 * Copyright 2026 Cognite AS
 */

import type { PerspectiveCamera, WebGLRenderer } from 'three';
import { Vector2 } from 'three';
import { It, Mock } from 'moq.ts';
import type { CadMaterialManager } from '../../packages/rendering';
import { RenderMode, forEachMaterial } from '../../packages/rendering';
import type { IntersectInput } from '../../packages/model-base';
import type { CadNode } from '../../packages/cad-model';
import { autoMockWebGLRenderer } from './autoMockWebGLRenderer';

const CANVAS_WIDTH = 4;
const CANVAS_HEIGHT = 2;
// Pixel (3, 1) of the 4x2 pick buffer, i.e. the one under normalized coordinates (0.5, 0.5).
export const PICKED_PIXEL_OFFSET = 4 * (3 + 1 * CANVAS_WIDTH);

type ReadFill = (readIndex: number, pixels: Uint8Array) => void;

export function createPickMaterialManager(): CadMaterialManager {
  return new Mock<CadMaterialManager>()
    .setup(p => p.getRenderMode())
    .returns(RenderMode.Color)
    .setup(p => p.setRenderMode(It.IsAny()))
    .returns()
    .setup(p => p.updateViewLighting(It.IsAny()))
    .returns()
    .object();
}

/**
 * Creates a renderer that counts and fills the pixel readbacks of picking. Readbacks of the full canvas size are
 * counted as full-frame reads, all others as single-pixel reads.
 */
export function createPickRenderer(fills: { fullFrame?: ReadFill; singlePixel?: ReadFill } = {}): {
  renderer: WebGLRenderer;
  fullFrameReadCount: () => number;
  singlePixelReadCount: () => number;
} {
  let fullFrameReads = 0;
  let singlePixelReads = 0;
  const readPixels = (args: unknown[]): Uint8Array => {
    const [, , , width, height, pixels] = args;
    if (typeof width !== 'number' || typeof height !== 'number' || !(pixels instanceof Uint8Array)) {
      throw new Error('Unexpected readRenderTargetPixels arguments');
    }
    if (width === CANVAS_WIDTH && height === CANVAS_HEIGHT) {
      fills.fullFrame?.(fullFrameReads, pixels);
      fullFrameReads++;
    } else {
      fills.singlePixel?.(singlePixelReads, pixels);
      singlePixelReads++;
    }
    return pixels;
  };

  const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>())
    .setup(r => r.readRenderTargetPixelsAsync(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
    .callback(({ args }) => Promise.resolve(readPixels(args)))
    .setup(r => r.readRenderTargetPixels(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
    .callback(({ args }) => {
      readPixels(args);
    })
    .object();

  return { renderer, fullFrameReadCount: () => fullFrameReads, singlePixelReadCount: () => singlePixelReads };
}

export function createPickInput(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  overrides?: Partial<IntersectInput>
): IntersectInput {
  const domElement = document.createElement('canvas');
  Object.defineProperty(domElement, 'clientWidth', { value: CANVAS_WIDTH });
  Object.defineProperty(domElement, 'clientHeight', { value: CANVAS_HEIGHT });
  return { normalizedCoords: new Vector2(0.5, 0.5), renderer, camera, clippingPlanes: [], domElement, ...overrides };
}

/**
 * Writes the tree index and model (even read index) or depth (odd read index) of a hit into the read pixels.
 */
export function writePickHit(
  pixels: Uint8Array,
  readIndex: number,
  hit: { treeIndex: number; modelIndex: number; depthByte: number },
  offset: number
): void {
  pixels.set(readIndex % 2 === 0 ? [0, 0, hit.treeIndex, hit.modelIndex + 1] : [hit.depthByte, 0, 0, 0], offset);
}

export function getModelIndexUniforms(cadNode: CadNode): number[] {
  const values: number[] = [];
  forEachMaterial(cadNode.cadMaterial.materials, material => values.push(material.uniforms.modelIndex.value));
  return values;
}
