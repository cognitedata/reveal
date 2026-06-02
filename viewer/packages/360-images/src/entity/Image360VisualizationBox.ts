/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import type { DeviceDescriptor, SceneHandler } from '@reveal/utilities';
import assert from 'assert';
import type { DataSourceType, Image360Face, Image360Texture } from '@reveal/data-providers';
import type { Image360Visualization } from './Image360Visualization';
import type { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';
import { detectJpegType, findProgressiveScanCutpoints, makePartialJpegBlob } from '../utils/JpegDataStreamParser';

type VisualizationState = {
  opacity: number;
  visible: boolean;
  scale: THREE.Vector3;
  renderOrder: number;
};

export const DEFAULT_IMAGE_360_OPACITY = 1;

export class Image360VisualizationBox implements Image360Visualization {
  private readonly MAX_MOBILE_IMAGE_SIZE = 1024;
  private readonly _worldTransform: THREE.Matrix4;
  private _visualizationMesh: THREE.Mesh | undefined;
  private _faceMaterials: THREE.MeshBasicMaterial[] = [];
  private readonly _sceneHandler: SceneHandler;
  private readonly _device: DeviceDescriptor;
  private readonly _visualizationState: VisualizationState;
  private readonly _textureLoader: THREE.TextureLoader;
  private readonly _faceMaterialOrder: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];
  private readonly _annotationsGroup: THREE.Group = new THREE.Group();
  private readonly _localTransform: THREE.Matrix4;

  get visible(): boolean {
    return this._visualizationState.visible;
  }

  set visible(value: boolean) {
    this._visualizationState.visible = value;

    if (this._visualizationMesh === undefined) {
      return;
    }
    this._visualizationMesh.visible = value;
  }

  get opacity(): number {
    return this._visualizationState.opacity;
  }

  set opacity(value: number) {
    this._visualizationState.opacity = value;

    this._faceMaterials.forEach(material => {
      material.opacity = value;
    });
  }

  set scale(value: THREE.Vector3) {
    this._visualizationState.scale = value;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.scale.copy(value);
  }

  set renderOrder(value: number) {
    this._visualizationState.renderOrder = value;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.renderOrder = value;
  }

  setAnnotations(annotations: ImageAnnotationObject<DataSourceType>[]): void {
    this._annotationsGroup.remove(...this._annotationsGroup.children);

    if (annotations.length === 0) {
      return;
    }

    this._annotationsGroup.add(...annotations.map(a => a.getObject()));
  }

  constructor(
    worldTransform: THREE.Matrix4,
    sceneHandler: SceneHandler,
    device: DeviceDescriptor,
    private readonly _requestRedraw: () => void = () => {}
  ) {
    this._localTransform = worldTransform.clone();
    this._worldTransform = worldTransform.clone();
    this._sceneHandler = sceneHandler;
    this._device = device;
    this._textureLoader = new THREE.TextureLoader();
    this._visualizationState = {
      opacity: DEFAULT_IMAGE_360_OPACITY,
      renderOrder: 3,
      scale: new THREE.Vector3(1, 1, 1),
      visible: true
    };
  }

  public setWorldTransform(matrix: THREE.Matrix4): void {
    this._worldTransform.copy(matrix).multiply(this._localTransform);

    if (this._visualizationMesh) {
      this._visualizationMesh.position.setFromMatrixPosition(this._worldTransform);
      this._visualizationMesh.rotation.setFromRotationMatrix(this._worldTransform);
    }
  }

  public loadImages(textures: Image360Texture[]): void {
    if (this._visualizationMesh) {
      this._faceMaterialOrder.forEach((face, index) => {
        this._faceMaterials[index].color.set(0xffffff);
        this._faceMaterials[index].map = getFaceTexture(face);
        this._faceMaterials[index].needsUpdate = true;
      });
      this._requestRedraw();
      return;
    }

    this._faceMaterials = this._faceMaterialOrder.map(
      face =>
        new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          map: getFaceTexture(face),
          depthTest: false,
          depthWrite: false,
          opacity: this._visualizationState.opacity,
          transparent: true
        })
    );

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const visualizationMesh = new THREE.Mesh(boxGeometry, this._faceMaterials);
    visualizationMesh.renderOrder = this._visualizationState.renderOrder;
    visualizationMesh.position.setFromMatrixPosition(this._worldTransform);
    visualizationMesh.rotation.setFromRotationMatrix(this._worldTransform);
    visualizationMesh.scale.copy(this._visualizationState.scale);
    visualizationMesh.visible = this._visualizationState.visible;
    visualizationMesh.add(this._annotationsGroup);
    this.setAnnotationsVisibility(false);
    this._visualizationMesh = visualizationMesh;

    this._sceneHandler.addObject3D(this._visualizationMesh);

    function getFaceTexture(face: Image360Face['face']) {
      const texture = textures.find(p => p.face === face);
      assert(texture !== undefined);
      return texture.texture;
    }
  }

  public getTransform(): THREE.Matrix4 {
    return this._worldTransform;
  }

  public loadFaceTextures(
    faces: Image360Face[],
    onFirstFaceReady?: () => void,
    onFirstFaceTypeDetected?: (type: 'progressive' | 'baseline') => void,
    abortSignal?: AbortSignal
  ): Promise<Image360Texture[]> {
    if (faces.some(f => f.downloadUrl)) {
      this.createPlaceholderMesh();
    }
    let firstFaceNotified = false;
    const notifyFirstFace = (): void => {
      if (!firstFaceNotified) {
        firstFaceNotified = true;
        onFirstFaceReady?.();
      }
    };
    let typeNotified = false;
    const notifyType = (type: 'progressive' | 'baseline'): void => {
      if (!typeNotified) {
        typeNotified = true;
        onFirstFaceTypeDetected?.(type);
      }
    };
    return Promise.all(
      faces.map(async face => {
        if (face.downloadUrl) {
          return this.loadFaceTextureStream(face, notifyFirstFace, notifyType, abortSignal);
        }
        const t = await this.loadFaceTextureFromBuffer(face);
        notifyFirstFace();
        return t;
      })
    );
  }

  public createPlaceholderMesh(): void {
    if (this._visualizationMesh !== undefined) return;

    this._faceMaterials = this._faceMaterialOrder.map(
      () =>
        new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          color: 0x000000,
          depthTest: false,
          depthWrite: false,
          opacity: this._visualizationState.opacity,
          transparent: true
        })
    );

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const visualizationMesh = new THREE.Mesh(boxGeometry, this._faceMaterials);
    visualizationMesh.renderOrder = this._visualizationState.renderOrder;
    visualizationMesh.position.setFromMatrixPosition(this._worldTransform);
    visualizationMesh.rotation.setFromRotationMatrix(this._worldTransform);
    visualizationMesh.scale.copy(this._visualizationState.scale);
    visualizationMesh.visible = this._visualizationState.visible;
    visualizationMesh.add(this._annotationsGroup);
    this.setAnnotationsVisibility(false);
    this._visualizationMesh = visualizationMesh;

    this._sceneHandler.addObject3D(this._visualizationMesh);
  }

  public updateFaceTexture(face: Image360Face['face'], texture: THREE.Texture): void {
    if (this._visualizationMesh === undefined) return;
    const index = this._faceMaterialOrder.indexOf(face);
    if (index === -1) return;
    const material = this._faceMaterials[index];
    material.color.set(0xffffff);
    material.map = texture;
    material.needsUpdate = true;
  }

  private async loadFaceTextureStream(
    image360Face: Image360Face,
    onFirstFaceReady?: () => void,
    onJpegTypeDetected?: (type: 'progressive' | 'baseline') => void,
    abortSignal?: AbortSignal
  ): Promise<Image360Texture> {
    const response = await fetch(image360Face.downloadUrl!, { mode: 'cors', credentials: 'omit', signal: abortSignal });
    if (!response.ok || !response.body) {
      throw new Error('Failed to fetch 360 image for face: ' + image360Face.face + ' (status ' + response.status + ')');
    }

    const contentLength = parseInt(response.headers.get('content-length') ?? '0', 10);
    let buffer = new Uint8Array(contentLength > 0 ? contentLength : 2 * 1024 * 1024);
    let bytesReceived = 0;
    let jpegType: 'progressive' | 'baseline' | 'unknown' = 'unknown';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    let texture: THREE.CanvasTexture | undefined;
    let lastCutpoint = 0;

    let resolveTexture!: (t: Image360Texture) => void;
    let rejectTexture!: (e: unknown) => void;
    const texturePromise = new Promise<Image360Texture>((resolve, reject) => {
      resolveTexture = resolve;
      rejectTexture = reject;
    });

    const applyBitmapToTexture = (bitmap: ImageBitmap): void => {
      if (this._visualizationMesh === undefined) {
        bitmap.close();
        return;
      }
      if (!texture) {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        ctx.drawImage(bitmap, 0, 0);
        texture = new THREE.CanvasTexture(canvas);
        texture.center.set(0.5, 0.5);
        texture.repeat.set(-1, 1);
        this.updateFaceTexture(image360Face.face, texture);
        onFirstFaceReady?.();
        resolveTexture({ face: image360Face.face, texture });
      } else {
        ctx.drawImage(bitmap, 0, 0);
        texture.needsUpdate = true;
      }
      bitmap.close();
      this._requestRedraw();
    };

    const decodeAndApplyScan = async (cutpoint: number): Promise<void> => {
      const blob = makePartialJpegBlob(buffer, cutpoint);
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(blob);
      } catch {
        return; // partial data not yet decodable — skip this cutpoint
      }
      applyBitmapToTexture(bitmap);
    };

    const reader = response.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (bytesReceived + value.length > buffer.length) {
          const grown = new Uint8Array(Math.max(buffer.length * 2, bytesReceived + value.length));
          grown.set(buffer.subarray(0, bytesReceived));
          buffer = grown;
        }

        buffer.set(value, bytesReceived);
        bytesReceived += value.length;

        // Detect JPEG type from header markers — resolved within the first few KB
        if (jpegType === 'unknown') {
          jpegType = detectJpegType(buffer.subarray(0, bytesReceived));
          if (jpegType !== 'unknown') {
            onJpegTypeDetected?.(jpegType);
          }
        }

        // Progressive JPEG: decode each scan as it arrives
        if (jpegType === 'progressive') {
          const cutpoints = findProgressiveScanCutpoints(buffer.subarray(0, bytesReceived));
          const newCutpoints = cutpoints.filter(cp => cp > lastCutpoint);
          if (newCutpoints.length > 0) {
            lastCutpoint = newCutpoints[newCutpoints.length - 1];
            await decodeAndApplyScan(lastCutpoint);
          }
        }
        // Baseline JPEG: just buffer — decode full image after download completes
      }
    } catch (e) {
      rejectTexture(e);
      return texturePromise;
    }

    if (jpegType === 'progressive') {
      if (!texture) {
        rejectTexture(new Error(`No decodable scan found for face: ${image360Face.face}`));
      }
    } else {
      // Baseline JPEG (or undetected): decode full downloaded buffer
      const blob = new Blob([buffer.subarray(0, bytesReceived)], { type: 'image/jpeg' });
      try {
        const bitmap = await createImageBitmap(blob);
        applyBitmapToTexture(bitmap);
      } catch (e) {
        rejectTexture(e);
      }
    }

    return texturePromise;
  }

  private async loadFaceTextureFromBuffer(image360Face: Image360Face): Promise<Image360Texture> {
    const blob = new Blob([image360Face.data], { type: image360Face.mimeType });
    const url = window.URL.createObjectURL(blob);
    let faceTexture: THREE.Texture<HTMLImageElement | HTMLCanvasElement> = await this._textureLoader.loadAsync(url);

    if (
      this._device.deviceType === 'mobile' &&
      (faceTexture.image.width > this.MAX_MOBILE_IMAGE_SIZE || faceTexture.image.height > this.MAX_MOBILE_IMAGE_SIZE)
    ) {
      faceTexture = await this.getScaledImageTexture(faceTexture, this.MAX_MOBILE_IMAGE_SIZE);
    }

    // Expecting the object-url to have been loaded into the texture, so we can revoke its blob reference, allowing the release of the blob from memory.
    window.URL.revokeObjectURL(url);

    // Need to horizontally flip the texture since it is being rendered inside a cube
    faceTexture.center.set(0.5, 0.5);
    faceTexture.repeat.set(-1, 1);
    return { face: image360Face.face, texture: faceTexture };
  }

  public unloadImages(): void {
    if (this._visualizationMesh === undefined) {
      return;
    }
    this._sceneHandler.removeObject3D(this._visualizationMesh);
    const imageContainerMaterial = this._visualizationMesh.material;
    const materials =
      imageContainerMaterial instanceof THREE.Material ? [imageContainerMaterial] : imageContainerMaterial;

    materials
      .map(material => material as THREE.MeshBasicMaterial)
      .forEach(material => {
        material.map?.dispose();
        material.dispose();
      });

    this._visualizationMesh.geometry.dispose();
    this._visualizationMesh = undefined;
    this._faceMaterials = [];
  }

  private async getScaledImageTexture(
    texture: THREE.Texture<HTMLImageElement | HTMLCanvasElement>,
    imageSize: number
  ): Promise<THREE.Texture<HTMLCanvasElement>> {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const { image } = texture;
    //Scale down the width and height
    let width = image.width;
    let height = image.height;

    // Calculate new dimensions while maintaining aspect ratio
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

    const scaledImageTexture = new THREE.CanvasTexture(canvas);
    texture.dispose();

    return scaledImageTexture;
  }

  public setAnnotationsVisibility(visibility: boolean): void {
    this._annotationsGroup.visible = visibility;
  }
}
