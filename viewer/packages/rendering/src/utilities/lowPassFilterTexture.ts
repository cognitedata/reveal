/*!
 * Copyright 2026 Cognite AS
 */

import { ClampToEdgeWrapping, LinearFilter, LinearMipMapLinearFilter, RepeatWrapping, Texture } from 'three';

type CanvasDrawableImage = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

const DEFAULT_DOWNSAMPLE_FACTOR = 16;

/**
 * Creates a cheap low-pass filtered (blurred) copy of an equirectangular texture.
 *
 * The source is downsampled to a small canvas and upsampled back to the original
 * resolution, relying on the browser's bilinear/box resampling to act as the blur
 * kernel - no shader/render target involved.
 *
 * The image is tiled three times horizontally before downsampling so the filter wraps
 * correctly across the U seam of the equirectangular projection (there is no equivalent
 * wrap in V, since the poles aren't periodic).
 *
 * Note: only supports texture sources that can be drawn onto a 2D canvas
 * (HTMLImageElement/HTMLCanvasElement/ImageBitmap), not raw DataTexture buffers.
 *
 * @param sourceTexture Texture to filter. Must already have its image data loaded.
 * @param downsampleFactor How many times smaller the intermediate blur buffer is, in
 * each dimension, relative to the source. Higher values produce a blurrier result.
 */
export function createLowPassFilteredTexture(
  sourceTexture: Texture,
  downsampleFactor: number = DEFAULT_DOWNSAMPLE_FACTOR
): Texture {
  const sourceImage = sourceTexture.image as CanvasDrawableImage | undefined;

  if (sourceImage === undefined || !sourceImage.width || !sourceImage.height) {
    throw new Error('createLowPassFilteredTexture: source texture has no readable image data');
  }

  const width = sourceImage.width;
  const height = sourceImage.height;

  const tiledCanvas = document.createElement('canvas');
  tiledCanvas.width = width * 3;
  tiledCanvas.height = height;
  const tiledContext = get2DContext(tiledCanvas);
  tiledContext.drawImage(sourceImage, 0, 0, width, height);
  tiledContext.drawImage(sourceImage, width, 0, width, height);
  tiledContext.drawImage(sourceImage, width * 2, 0, width, height);

  const smallWidth = Math.max(3, Math.round((width * 3) / downsampleFactor));
  const smallHeight = Math.max(1, Math.round(height / downsampleFactor));

  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = smallWidth;
  smallCanvas.height = smallHeight;
  const smallContext = get2DContext(smallCanvas);
  smallContext.imageSmoothingEnabled = true;
  smallContext.imageSmoothingQuality = 'high';
  smallContext.drawImage(tiledCanvas, 0, 0, smallCanvas.width, smallCanvas.height);

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;
  const resultContext = get2DContext(resultCanvas);
  resultContext.imageSmoothingEnabled = true;
  resultContext.imageSmoothingQuality = 'high';
  // Upsample back to the original resolution and shift by one tile width so the centre
  // tile - which now blends smoothly across the wrap seam - lands at (0, 0).
  resultContext.drawImage(smallCanvas, -width, 0, width * 3, height);

  const filteredTexture = new Texture(resultCanvas);
  filteredTexture.colorSpace = sourceTexture.colorSpace;
  filteredTexture.wrapS = RepeatWrapping;
  filteredTexture.wrapT = ClampToEdgeWrapping;
  filteredTexture.minFilter = LinearMipMapLinearFilter;
  filteredTexture.magFilter = LinearFilter;
  filteredTexture.generateMipmaps = true;
  filteredTexture.needsUpdate = true;

  return filteredTexture;
}

function get2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('createLowPassFilteredTexture: failed to acquire 2D canvas context');
  }
  return context;
}
