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
import { CanvasTexture } from 'three';

export type Image360FaceWithUrl = Image360Face & { downloadUrl: string };

export function hasDownloadUrl(face: Image360Face): face is Image360FaceWithUrl {
  return face.downloadUrl !== undefined;
}

type CanvasTextureState = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: CanvasTexture | undefined;
};

type StreamResult = {
  fullBuffer: Uint8Array<ArrayBuffer>;
  bytesReceived: number;
  jpegType: JpegType | 'unknown';
};

type DeferredPromise<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

/**
 * Handles all texture loading for 360 image cube faces:
 * - URL-based streaming (progressive and baseline JPEG detection)
 * - In-memory buffer decoding
 */
export class Image360FaceTextureLoader {
  private readonly MAX_MOBILE_IMAGE_SIZE = 1024;

  constructor(
    private readonly _device: DeviceDescriptor,
    private readonly _textureLoader: TextureLoader,
    private readonly _requestRedraw: () => void,
    private readonly _updateFaceTexture: (face: Image360Face['face'], texture: Texture) => void,
    private readonly _isMeshAlive: () => boolean
  ) {}

  loadFromUrl(
    face: Image360FaceWithUrl,
    onFirstFaceReady?: () => void,
    onJpegTypeDetected?: (type: JpegType) => void,
    abortSignal?: AbortSignal
  ): Promise<Image360Texture> {
    return this.streamFaceTexture(face, onFirstFaceReady, onJpegTypeDetected, abortSignal);
  }

  async loadFromBuffer(face: Image360Face): Promise<Image360Texture> {
    const blob = new Blob([face.data], { type: face.mimeType });
    const url = window.URL.createObjectURL(blob);
    let faceTexture: Texture<HTMLImageElement | HTMLCanvasElement> = await this._textureLoader.loadAsync(url);

    if (
      this._device.deviceType === 'mobile' &&
      (faceTexture.image.width > this.MAX_MOBILE_IMAGE_SIZE || faceTexture.image.height > this.MAX_MOBILE_IMAGE_SIZE)
    ) {
      faceTexture = await this.getScaledImageTexture(faceTexture, this.MAX_MOBILE_IMAGE_SIZE);
    }

    window.URL.revokeObjectURL(url);
    faceTexture.center.set(0.5, 0.5);
    faceTexture.repeat.set(-1, 1);
    return { face: face.face, texture: faceTexture };
  }

  private async streamFaceTexture(
    face: Image360FaceWithUrl,
    onFirstFaceReady?: () => void,
    onJpegTypeDetected?: (type: JpegType) => void,
    abortSignal?: AbortSignal
  ): Promise<Image360Texture> {
    const { body, contentLength } = await this.fetchFace(face, abortSignal);
    const textureState = this.createCanvasTextureState();
    const deferred = this.createDeferred<Image360Texture>();

    const { fullBuffer, bytesReceived, jpegType } = await this.readStream(
      body,
      contentLength,
      onJpegTypeDetected,
      async (partialBlob: Blob) => {
        const bitmap = await createImageBitmap(partialBlob).catch(() => null);
        if (bitmap) this.applyBitmapToTexture(bitmap, face, textureState, onFirstFaceReady, deferred.resolve);
      },
      deferred.reject
    );

    await this.finalizeTexture(jpegType, fullBuffer, bytesReceived, face, textureState, onFirstFaceReady, deferred);
    return deferred.promise;
  }

  private async fetchFace(
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

  private createCanvasTextureState(): CanvasTextureState {
    const canvas = document.createElement('canvas');
    return { canvas, ctx: canvas.getContext('2d')!, texture: undefined };
  }

  private createDeferred<T>(): DeferredPromise<T> {
    let resolve: (value: T) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  private async readStream(
    body: ReadableStream<Uint8Array>,
    contentLength: string | null,
    onJpegTypeDetected: ((type: JpegType) => void) | undefined,
    onProgressiveScan: (partialBlob: Blob) => Promise<void>,
    onError: (e: unknown) => void
  ): Promise<StreamResult> {
    const size = parseInt(contentLength ?? '0', 10);
    let fullBuffer: Uint8Array<ArrayBuffer> = new Uint8Array(size > 0 ? size : 2 * 1024 * 1024);
    let bytesReceived = 0;
    let jpegType: JpegType | 'unknown' = 'unknown';
    let lastCutpoint = 0;

    const reader = body.getReader();
    try {
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
    } catch (e) {
      onError(e);
    }

    return { fullBuffer, bytesReceived, jpegType };
  }

  private async finalizeTexture(
    jpegType: JpegType | 'unknown',
    fullBuffer: Uint8Array<ArrayBuffer>,
    bytesReceived: number,
    face: Image360FaceWithUrl,
    state: CanvasTextureState,
    onFirstFaceReady: (() => void) | undefined,
    deferred: DeferredPromise<Image360Texture>
  ): Promise<void> {
    if (jpegType === 'progressive') {
      if (!state.texture) {
        deferred.reject(new Error(`No decodable scan found for face: ${face.face}`));
      }
      return;
    }
    const blob = new Blob([fullBuffer.subarray(0, bytesReceived)], { type: 'image/jpeg' });
    try {
      const bitmap = await createImageBitmap(blob);
      this.applyBitmapToTexture(bitmap, face, state, onFirstFaceReady, deferred.resolve);
    } catch (e) {
      deferred.reject(e);
    }
  }

  private applyBitmapToTexture(
    bitmap: ImageBitmap,
    face: Image360FaceWithUrl,
    state: CanvasTextureState,
    onFirstFaceReady: (() => void) | undefined,
    resolveTexture: (t: Image360Texture) => void
  ): void {
    if (!this._isMeshAlive()) {
      bitmap.close();
      return;
    }
    if (!state.texture) {
      state.canvas.width = bitmap.width;
      state.canvas.height = bitmap.height;
      state.ctx.drawImage(bitmap, 0, 0);
      state.texture = new CanvasTexture(state.canvas);
      state.texture.center.set(0.5, 0.5);
      state.texture.repeat.set(-1, 1);
      this._updateFaceTexture(face.face, state.texture);
      onFirstFaceReady?.();
      resolveTexture({ face: face.face, texture: state.texture });
    } else {
      state.ctx.drawImage(bitmap, 0, 0);
      state.texture.needsUpdate = true;
    }
    bitmap.close();
    this._requestRedraw();
  }

  private async getScaledImageTexture(
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
}
