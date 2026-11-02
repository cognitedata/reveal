/*!
 * Copyright 2026 Cognite AS
 */

import type { DeviceDescriptor } from '@reveal/utilities';
import type { Image360Face, Image360Texture } from '@reveal/data-providers';
import {
  type JpegType,
  detectJpegType,
  findProgressiveScanCutpoints,
  makePartialJpegBlob
} from '../utils/JpegDataStreamParser';
import type { Texture, TextureLoader } from 'three';
import { CanvasTexture, LinearFilter } from 'three';

export type Image360FaceWithUrl = Image360Face & { downloadUrl: string };

export function hasDownloadUrl(face: Image360Face): face is Image360FaceWithUrl {
  return face.downloadUrl !== undefined;
}

// Minimum time between two progressive scans being drawn and re-uploaded for the same face.
const MIN_PROGRESSIVE_SCAN_INTERVAL_MS = 250;

// Canvas-backed textures that only live while a face is streaming.
const intermediateTextures = new WeakSet<Texture>();

export function disposeFaceTexture(texture: Texture): void {
  texture.dispose();
  if (intermediateTextures.delete(texture) && texture.image instanceof HTMLCanvasElement) {
    texture.image.width = 0;
    texture.image.height = 0;
  }
}

type ProgressiveTextureState = {
  ctx: CanvasRenderingContext2D | undefined;
  texture: CanvasTexture | undefined;
  lastScanAppliedAt: number | undefined;
};

type StreamResult = {
  fullBuffer: Uint8Array<ArrayBuffer>;
  bytesReceived: number;
  jpegType: JpegType | 'unknown';
};

export interface FaceTextureLoader {
  load(
    face: Image360Face,
    onFirstFaceReady?: () => void,
    onJpegTypeDetected?: (type: JpegType) => void,
    abortSignal?: AbortSignal
  ): Promise<Image360Texture>;
}

/**
 * Handles all texture loading for 360 image cube faces:
 * - URL-based streaming (progressive and baseline JPEG detection)
 * - In-memory buffer decoding
 */
export class Image360FaceTextureLoader implements FaceTextureLoader {
  private readonly MAX_MOBILE_IMAGE_SIZE = 1024;

  constructor(
    private readonly _device: DeviceDescriptor,
    private readonly _textureLoader: TextureLoader,
    private readonly _onUpdate: () => void,
    private readonly _updateFaceTexture: (face: Image360Face['face'], texture: Texture) => void,
    private readonly _isMeshAlive: () => boolean
  ) {}

  /**
   * Loads a texture for a single cube face. Automatically selects the streaming path when
   * face has a downloadUrl (progressive/baseline JPEG detection) or decodes from in-memory buffer otherwise.
   */
  async load(
    face: Image360Face,
    onFirstFaceReady?: () => void,
    onJpegTypeDetected?: (type: JpegType) => void,
    abortSignal?: AbortSignal
  ): Promise<Image360Texture> {
    if (hasDownloadUrl(face)) {
      return this.streamFaceTexture(face, onFirstFaceReady, onJpegTypeDetected, abortSignal);
    }
    const texture = await this.loadFromBuffer(face);
    onFirstFaceReady?.();
    return texture;
  }

  private async loadFromBuffer(face: Image360Face): Promise<Image360Texture> {
    const texture = await this.decodeTexture(new Blob([face.data], { type: face.mimeType }));
    return { face: face.face, texture };
  }

  private async decodeTexture(blob: Blob): Promise<Texture> {
    const url = window.URL.createObjectURL(blob);
    try {
      let faceTexture: Texture<HTMLImageElement | HTMLCanvasElement> = await this._textureLoader.loadAsync(url);

      if (
        this._device.deviceType === 'mobile' &&
        (faceTexture.image.width > this.MAX_MOBILE_IMAGE_SIZE || faceTexture.image.height > this.MAX_MOBILE_IMAGE_SIZE)
      ) {
        faceTexture = await getScaledImageTexture(faceTexture, this.MAX_MOBILE_IMAGE_SIZE);
      }

      faceTexture.center.set(0.5, 0.5);
      faceTexture.repeat.set(-1, 1);
      return faceTexture;
    } finally {
      window.URL.revokeObjectURL(url);
    }
  }

  private async streamFaceTexture(
    face: Image360FaceWithUrl,
    onFirstFaceReady?: () => void,
    onJpegTypeDetected?: (type: JpegType) => void,
    abortSignal?: AbortSignal
  ): Promise<Image360Texture> {
    const { body, contentLength } = await fetchFace(face, abortSignal);
    const progressiveState: ProgressiveTextureState = {
      ctx: undefined,
      texture: undefined,
      lastScanAppliedAt: undefined
    };
    let finalTexture: Texture | undefined;

    try {
      const { fullBuffer, bytesReceived } = await readStream(
        body,
        contentLength,
        onJpegTypeDetected,
        async (partialBlob: Blob) => {
          if (!shouldApplyScan(progressiveState)) return;
          const bitmap = await createImageBitmap(partialBlob).catch(() => null);
          if (bitmap) this.applyBitmapToTexture(bitmap, face, progressiveState, onFirstFaceReady);
        }
      );

      this.throwIfNoLongerNeeded(face, abortSignal);
      const texture = await this.decodeTexture(
        new Blob([fullBuffer.subarray(0, bytesReceived)], { type: face.mimeType })
      );
      try {
        this.throwIfNoLongerNeeded(face, abortSignal);
      } catch (error) {
        texture.dispose();
        throw error;
      }

      finalTexture = texture;
      this._updateFaceTexture(face.face, finalTexture);
      if (progressiveState.texture === undefined) {
        onFirstFaceReady?.();
      }
      this._onUpdate();
      return { face: face.face, texture: finalTexture };
    } finally {
      if (progressiveState.texture !== undefined && (finalTexture !== undefined || !this._isMeshAlive())) {
        disposeFaceTexture(progressiveState.texture);
      }
    }
  }

  private throwIfNoLongerNeeded(face: Image360FaceWithUrl, abortSignal: AbortSignal | undefined): void {
    if (abortSignal?.aborted === true || !this._isMeshAlive()) {
      throw new Error(`360 image face ${face.face} is no longer needed`);
    }
  }

  private applyBitmapToTexture(
    bitmap: ImageBitmap,
    face: Image360FaceWithUrl,
    state: ProgressiveTextureState,
    onFirstFaceReady: (() => void) | undefined
  ): void {
    if (!this._isMeshAlive()) {
      bitmap.close();
      return;
    }
    if (state.texture === undefined || state.ctx === undefined) {
      const { canvas, ctx } = createCanvas(bitmap.width, bitmap.height);
      ctx.drawImage(bitmap, 0, 0);
      state.ctx = ctx;
      state.texture = createIntermediateTexture(canvas);
      this._updateFaceTexture(face.face, state.texture);
      onFirstFaceReady?.();
    } else {
      state.ctx.drawImage(bitmap, 0, 0);
      state.texture.needsUpdate = true;
    }
    state.lastScanAppliedAt = performance.now();
    bitmap.close();
    this._onUpdate();
  }
}

function shouldApplyScan(state: ProgressiveTextureState): boolean {
  return (
    state.lastScanAppliedAt === undefined ||
    performance.now() - state.lastScanAppliedAt >= MIN_PROGRESSIVE_SCAN_INTERVAL_MS
  );
}

function createIntermediateTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  // Replaced by the final texture when the download completes, so skip mipmap generation on every scan.
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.center.set(0.5, 0.5);
  texture.repeat.set(-1, 1);
  intermediateTextures.add(texture);
  return texture;
}
async function getScaledImageTexture(
  texture: Texture<HTMLImageElement | HTMLCanvasElement>,
  imageSize: number
): Promise<Texture<HTMLCanvasElement>> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const { image } = texture;
  let width = image.width;
  let height = image.height;

  if (width > imageSize) {
    height *= imageSize / width;
    width = imageSize;
  }
  if (height > imageSize) {
    width *= imageSize / height;
    height = imageSize;
  }
  canvas.width = width;
  canvas.height = height;
  context?.drawImage(image, 0, 0, canvas.width, canvas.height);

  const scaledImageTexture = new CanvasTexture(canvas);
  texture.dispose();
  return scaledImageTexture;
}

async function readStream(
  body: ReadableStream<Uint8Array>,
  contentLength: string | null,
  onJpegTypeDetected: ((type: JpegType) => void) | undefined,
  onProgressiveScan: (partialBlob: Blob) => Promise<void>
): Promise<StreamResult> {
  const parsed = parseInt(contentLength ?? '0', 10);
  const size = isNaN(parsed) ? 0 : parsed;
  let fullBuffer: Uint8Array<ArrayBuffer> = new Uint8Array(size > 0 ? size : 2 * 1024 * 1024);
  let bytesReceived = 0;
  let jpegType: JpegType | 'unknown' = 'unknown';
  let lastCutpoint = 0;

  const reader = body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (bytesReceived + value.length > fullBuffer.length) {
      const grown = new Uint8Array(Math.max(fullBuffer.length * 2, bytesReceived + value.length));
      grown.set(fullBuffer.subarray(0, bytesReceived));
      fullBuffer = grown;
    }
    fullBuffer.set(value, bytesReceived);
    bytesReceived += value.length;

    if (jpegType === 'unknown') {
      jpegType = detectJpegType(fullBuffer.subarray(0, bytesReceived));
      if (jpegType !== 'unknown') onJpegTypeDetected?.(jpegType);
    }

    if (jpegType === 'progressive') {
      const cutpoints = findProgressiveScanCutpoints(fullBuffer.subarray(0, bytesReceived));
      const newCutpoints = cutpoints.filter(cp => cp > lastCutpoint);
      if (newCutpoints.length > 0) {
        lastCutpoint = newCutpoints[newCutpoints.length - 1];
        await onProgressiveScan(makePartialJpegBlob(fullBuffer, lastCutpoint));
      }
    }
  }

  return { fullBuffer, bytesReceived, jpegType };
}

async function fetchFace(
  face: Image360FaceWithUrl,
  abortSignal?: AbortSignal
): Promise<{ body: ReadableStream<Uint8Array>; contentLength: string | null }> {
  const response = await fetch(face.downloadUrl, {
    mode: 'cors',
    credentials: 'omit',
    signal: abortSignal
  });
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch 360 image for face: ${face.face} (status ${response.status})`);
  }
  return { body: response.body, contentLength: response.headers.get('content-length') };
}

function createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to obtain 2D rendering context for canvas texture.');
  }
  return { canvas, ctx };
}
