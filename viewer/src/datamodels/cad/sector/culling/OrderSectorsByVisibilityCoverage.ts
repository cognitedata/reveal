/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata, WantedSector } from '../types';
import { coverageShaders } from '../../rendering/shaders';
import { CadModelMetadata } from '../../CadModelMetadata';
import { toThreeJsBox3, Box3 } from '../../../../utilities';
import { WebGLRendererStateHelper } from '../../../../utilities/WebGLRendererStateHelper';
import { AlreadyLoadedGeometryDepthTextureProvider } from './AlreadyLoadedGeometryTextureProvider';

type SectorContainer = {
  model: CadModelMetadata;
  sectors: SectorMetadata[];
  sectorIdOffset: number;
  renderable: THREE.Object3D;
};

type SectorVisibility = {
  sectorIdWithOffset: number;
  weight: number;
  distance: number;
};

const identityRotation = new THREE.Quaternion();

/**
 * Options for OrderSectorsByVisibleCoverage.
 */
export interface OrderSectorsByVisibleCoverageOptions {
  /**
   * Renderer used to render coverage.
   */
  renderer: THREE.WebGLRenderer;

  /**
   * Initializes a render target with already loaded geometry for pre-load
   * occlusion.
   */
  alreadyLoadedProvider: AlreadyLoadedGeometryDepthTextureProvider;
}

export type PrioritizedSectorIdentifier = {
  /**
   * The CAD model that holds the sector.
   */
  model: CadModelMetadata;
  /**
   * Sector ID contained in the model provided.
   */
  sectorId: number;
  /**
   * A number between 0 and 1 indicating how 'important' the sector is.
   */
  priority: number;
};

/**
 * Interface for classes that estimates how visible a sector will be on screen.
 */
export interface OrderSectorsByVisibilityCoverage {
  /**
   * Dispose any resources that cannot be garbage collected.
   */
  dispose(): void;

  /**
   * Specifies what CAD models to estimate sector visibility for.
   * @param models Models to estimate sector visibility for.
   */
  setModels(models: CadModelMetadata[]): void;

  /**
   * Specify clipping planes.
   * @param planes            A list of clip planes or null to disable clipping.
   * @param clipIntersection  When true, intersection clipping is enabled.
   */
  setClipping(planes: THREE.Plane[] | null, clipIntersection: boolean): void;

  cullOccludedSectors(camera: THREE.PerspectiveCamera, sectors: WantedSector[]): WantedSector[];

  /**
   * Estimates how visible the different sectors for the models added are and returns
   * a prioritized list.
   * @param camera The current viewpoint.
   */
  orderSectorsByVisibility(camera: THREE.Camera): PrioritizedSectorIdentifier[];
}

/**
 * Estimates sector visibility by rendering their bounds with a pattern confirming to how
 * much of the geometry covers of the bounding box.
 */
export class GpuOrderSectorsByVisibilityCoverage implements OrderSectorsByVisibilityCoverage {
  private sectorIdOffset = 0;
  private readonly scene = new THREE.Scene();
  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _alreadyLoadedProvider: AlreadyLoadedGeometryDepthTextureProvider;
  // private debugRenderer?: THREE.WebGLRenderer;
  private _debugImageElement?: HTMLImageElement;
  private readonly renderTarget: THREE.WebGLRenderTarget;
  private readonly containers: Map<string, SectorContainer> = new Map();
  private readonly buffers = {
    rtBuffer: new Uint8Array(),
    sectorVisibilityBuffer: [] as SectorVisibility[]
  };

  private readonly coverageMaterial = new THREE.ShaderMaterial({
    vertexShader: coverageShaders.vertex,
    fragmentShader: coverageShaders.fragment,
    clipping: true,
    side: THREE.DoubleSide
  });

  constructor(options: OrderSectorsByVisibleCoverageOptions) {
    this._renderer = options.renderer;
    this._alreadyLoadedProvider = options.alreadyLoadedProvider;

    const size = this._renderer.getSize(new THREE.Vector2());
    this.renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
      generateMipmaps: false,
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      stencilBuffer: true
    });
  }

  dispose() {
    this._renderer.dispose();
  }

  get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }

  createDebugCanvas(options?: { width: number; height: number }): HTMLElement {
    if (this._debugImageElement) {
      throw new Error('createDebugCanvas() can only be called once');
    }
    const width = options ? options.width : this.renderTarget.width;
    const height = options ? options.height : this.renderTarget.height;
    this._debugImageElement = document.createElement('img');
    this._debugImageElement.style.width = `${width}px`;
    this._debugImageElement.style.height = `${height}px`;
    return this._debugImageElement;
  }

  setModels(models: CadModelMetadata[]) {
    const keepModelIdentifiers = new Set<string>();
    for (const model of models) {
      const blobUrl = model.blobUrl;
      keepModelIdentifiers.add(blobUrl);
      const container = this.containers.get(blobUrl);
      if (container) {
        this.updateModel(container, model);
      } else {
        this.addModel(model);
      }
    }

    const allIdentifiers = new Set<string>(this.containers.keys());
    const discardIdentifiers = new Set([...allIdentifiers].filter(x => !keepModelIdentifiers.has(x)));
    for (const modelIdentifier of discardIdentifiers) {
      this.removeModel(modelIdentifier);
    }
  }

  setClipping(planes: THREE.Plane[] | null, clipIntersection: boolean) {
    this.coverageMaterial.clippingPlanes = planes;
    this.coverageMaterial.clipIntersection = clipIntersection;
  }

  cullOccludedSectors(camera: THREE.PerspectiveCamera, sectors: WantedSector[]): WantedSector[] {
    const ordered = this.orderSectorsByVisibility(camera);
    const filtered = sectors.filter(toBeFiltered => {
      const found = ordered.some(
        x => x.model.blobUrl === toBeFiltered.blobUrl && x.sectorId === toBeFiltered.metadata.id
      );
      return found;
    });
    console.log(`Filtered ${sectors.length} to ${filtered.length} sectors`);
    return filtered;
  }

  orderSectorsByVisibility(camera: THREE.PerspectiveCamera): PrioritizedSectorIdentifier[] {
    if (this._debugImageElement) {
      this.renderSectors(null, camera);
      this._debugImageElement.src = this._renderer.domElement.toDataURL();
    }

    this.renderSectors(this.renderTarget, camera);

    // Read back result from GPU
    this._renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      this.renderTarget.width,
      this.renderTarget.height,
      this.buffers.rtBuffer
    );

    // Unpack GPU result to sector IDs with visibility score
    const sectorVisibility = this.unpackSectorVisibility(
      this.renderTarget.width,
      this.renderTarget.height,
      this.buffers.rtBuffer
    );

    // Map to IDs that the world understands
    const totalWeight = sectorVisibility.reduce((weight, x) => x.weight + weight, 0);
    const result = sectorVisibility
      .filter(x => x.weight > 0)
      // Sort by "hit" to put most visible sectors first
      .sort((left, right) => {
        if (left && right) {
          return right.weight - left.weight;
        } else if (left) {
          return -1;
        } else if (right) {
          return 1;
        }
        return 0;
      })
      .map(x => {
        const container = this.findSectorContainer(x.sectorIdWithOffset);
        const sectorId = x.sectorIdWithOffset - container.sectorIdOffset;
        return {
          model: container.model,
          sectorId,
          priority: x.weight / totalWeight,
          depth: x.distance
        };
      });
    return result;
  }

  private renderSectors(renderTarget: THREE.WebGLRenderTarget | null, camera: THREE.PerspectiveCamera): void {
    const stateHelper = new WebGLRendererStateHelper(this._renderer);
    try {
      stateHelper.setClearColor('#FFFFFF');
      stateHelper.localClippingEnabled = true;
      stateHelper.setRenderTarget(renderTarget);
      stateHelper.autoClear = false;

      // 1. Clear render target (depth + color)
      this._renderer.clear(true, true);

      // 2. Render already loaded geometry to offscreen buffer
      this._alreadyLoadedProvider.renderDepthToTarget(renderTarget, camera);

      // 3. Render to offscreen buffer
      this._renderer.render(this.scene, camera);

      // 4. Prepare buffer for reading from GPU
      this.prepareBuffers();
    } finally {
      stateHelper.resetState();
    }
  }

  private removeModel(modelIdentifier: string) {
    const container = this.containers.get(modelIdentifier);
    if (!container) {
      throw new Error(`Could not find model '${modelIdentifier}'`);
    }
    this.scene.remove(container.renderable);
    this.containers.delete(modelIdentifier);
  }

  private addModel(model: CadModelMetadata) {
    const sectors = model.scene.getAllSectors();
    const mesh = this.createSectorTreeMesh(this.sectorIdOffset, sectors, model.modelMatrix);
    this.containers.set(model.blobUrl, {
      model,
      sectors,
      sectorIdOffset: this.sectorIdOffset,
      renderable: mesh
    });
    this.sectorIdOffset += sectors.length;
    this.scene.add(mesh);
  }

  private updateModel(container: SectorContainer, model: CadModelMetadata) {
    container.renderable.matrix.copy(model.modelMatrix);
    container.renderable.updateMatrixWorld(true);
  }

  private findSectorContainer(sectorIdWithOffset: number): SectorContainer {
    for (const container of this.containers.values()) {
      if (
        sectorIdWithOffset >= container.sectorIdOffset &&
        sectorIdWithOffset < container.sectorIdOffset + container.sectors.length
      ) {
        return container;
      }
    }
    throw new Error(`Sector ID ${sectorIdWithOffset} is out of range`);
  }

  private unpackSectorVisibility(
    renderTargetWidth: number,
    renderTargetHeight: number,
    renderTargetBuffer: Uint8Array
  ): SectorVisibility[] {
    // Weight function that prioritizes pixels in the middle of the screen.
    // See https://www.wolframalpha.com/input/?i=plot+%282.5+-+%28x%5E2+%2B+y%5E2%29+%2B+2*e%5E%28-sqrt%28x%5E2+%2B+y%5E2%29%29%29%2F2%2C+x+in+%5B-1%2C+1%5D+y+in+%5B-1%2C+1%5D
    function weight(x: number, y: number): number {
      const s = x * x + y * y;
      return 0.5 * (2.5 - s) + Math.exp(-Math.sqrt(s));
    }

    const sectorVisibility = this.buffers.sectorVisibilityBuffer;
    const halfHeight = renderTargetHeight / 2;
    const halfWidth = renderTargetWidth / 2;
    for (let y = 0; y < renderTargetHeight; y++) {
      const ry = (y - renderTargetHeight / 2) / halfHeight;
      for (let x = 0; x < renderTargetWidth; x++) {
        const i = x + renderTargetWidth * y;
        const r = renderTargetBuffer[4 * i + 0];
        const g = renderTargetBuffer[4 * i + 1];
        const b = renderTargetBuffer[4 * i + 2];
        const distance = renderTargetBuffer[4 * i + 3]; // Distance stored in alpha
        if (r !== 255 || g !== 255 || b !== 255) {
          const rx = (y - halfWidth) / halfWidth;

          const sectorIdWithOffset = b + g * 255 + r * 255 * 255;
          const value = sectorVisibility[sectorIdWithOffset] || { sectorIdWithOffset, weight: 0, distance };
          value.weight += weight(rx, ry);
          value.distance = Math.min(value.distance, distance);
          sectorVisibility[sectorIdWithOffset] = value;
        }
      }
    }
    return sectorVisibility;
  }

  private prepareBuffers() {
    // Ensure buffer can hold all pixels from render target
    if (this.buffers.rtBuffer.length < 4 * this.renderTarget.width * this.renderTarget.height) {
      this.buffers.rtBuffer = new Uint8Array(4 * this.renderTarget.width * this.renderTarget.height);
    }

    // Blank visibility information
    for (let i = 0; i < this.buffers.sectorVisibilityBuffer.length; i++) {
      const entry = this.buffers.sectorVisibilityBuffer[i];
      if (entry) {
        entry.weight = 0;
      }
    }
  }

  private createSectorTreeMesh(
    sectorIdOffset: number,
    sectors: SectorMetadata[],
    modelMatrix: THREE.Matrix4
  ): THREE.Object3D {
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    group.applyMatrix4(modelMatrix);
    group.updateMatrixWorld();

    const sectorCount = sectors.length;

    const instanceValues = new Float32Array(4 * sectorCount); // sectorId, coverageFactor[3]
    const boxGeometry = new THREE.BoxBufferGeometry();
    const mesh = new THREE.InstancedMesh(boxGeometry, this.coverageMaterial, sectorCount);

    const bounds = new THREE.Box3();
    const addSector = (sectorBounds: Box3, sectorId: number, coverage: THREE.Vector3) => {
      toThreeJsBox3(bounds, sectorBounds);
      const translation = bounds.getCenter(new THREE.Vector3());
      const scale = bounds.getSize(new THREE.Vector3());

      const instanceMatrix = new THREE.Matrix4().compose(translation, identityRotation, scale);
      mesh.setMatrixAt(sectorId, instanceMatrix);

      instanceValues[4 * sectorId + 0] = sectorIdOffset + sectorId;
      instanceValues[4 * sectorId + 1] = coverage.x;
      instanceValues[4 * sectorId + 2] = coverage.y;
      instanceValues[4 * sectorId + 3] = coverage.z;
    };

    const coverageFactors = new THREE.Vector3(); // Allocate once only
    sectors.forEach(sector => {
      // Note! We always use the 'high detail' coverage factors, not recursiveCoverageFactors because we
      // don't know what detail level a sector will be loaded in. A better approach might be to choose this
      // runtime (either before rendering or in shader), but not sure how to solve this. -lars 2020-04-22
      const { xy, xz, yz } = sector.facesFile.coverageFactors;
      coverageFactors.set(yz, xz, xy);
      addSector(sector.bounds, sector.id, coverageFactors);
    });

    const buffer = new THREE.InstancedInterleavedBuffer(instanceValues, 4);
    boxGeometry.setAttribute('a_sectorId', new THREE.InterleavedBufferAttribute(buffer, 1, 0));
    boxGeometry.setAttribute('a_coverageFactor', new THREE.InterleavedBufferAttribute(buffer, 3, 1));

    group.add(mesh);
    return group;
  }
}
