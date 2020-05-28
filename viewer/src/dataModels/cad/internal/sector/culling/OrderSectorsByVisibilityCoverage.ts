/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { SectorModelTransformation, SectorMetadata } from '../types';
import { toThreeJsBox3, toThreeMatrix4 } from '@/utilities';
import { Box3 } from '@/utilities/Box3';
import { coverageShaders } from '@/dataModels/cad/internal/rendering/shaders';
import { CadModelMetadata } from '@/dataModels/cad/public/CadModelMetadata';

type SectorContainer = {
  model: CadModelMetadata;
  sectors: SectorMetadata[];
  sectorIdOffset: number;
  renderable: THREE.Object3D;
};

type SectorVisibility = {
  sectorIdWithOffset: number;
  hitCount: number;
  distance: number;
};

const coverageMaterial = new THREE.ShaderMaterial({
  vertexShader: coverageShaders.vertex,
  fragmentShader: coverageShaders.fragment,
  clipping: true,
  clippingPlanes: [new THREE.Plane()]
});
const identityRotation = new THREE.Quaternion();

/**
 * Options for OrderSectorsByVisibleCoverage.
 */
export interface OrderSectorsByVisibleCoverageOptions {
  /**
   * Optional WebGL context to use for rendering of coverage.
   */
  glContext?: WebGLRenderingContext;
  /**
   * Optional size of the framebuffer used for rendering coverage.
   */
  renderSize?: THREE.Vector2;
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
   * Specifies what CAD models to estimate sector visibility for.
   * @param models Models to estimate sector visibility for.
   */
  setModels(models: CadModelMetadata[]): void;
  /**
   * Estimates how visible the different sectors for the models added are and returns
   * a prioritized list.
   * @param camera The current viewpoint.
   */
  orderSectorsByVisibility(camera: THREE.Camera, clippingPlanes: THREE.Plane[]): PrioritizedSectorIdentifier[];
}

/**
 * Estimates sector visibility by rendering their bounds with a pattern confirming to how
 * much of the geometry covers of the bounding box.
 */
export class GpuOrderSectorsByVisibilityCoverage {
  private sectorIdOffset = 0;
  private readonly scene = new THREE.Scene();
  private readonly _renderer: THREE.WebGLRenderer;
  private debugRenderer?: THREE.WebGLRenderer;
  private readonly renderTarget: THREE.WebGLRenderTarget;
  private readonly containers: Map<string, SectorContainer> = new Map();
  private readonly buffers = {
    rtBuffer: new Uint8Array(),
    sectorVisibilityBuffer: [] as SectorVisibility[]
  };

  constructor(options?: OrderSectorsByVisibleCoverageOptions) {
    const context = (options || {}).glContext;
    const renderSize = (options || {}).renderSize || new THREE.Vector2(640, 480);
    this._renderer = new THREE.WebGLRenderer({
      context,
      antialias: false,
      alpha: false,
      precision: 'lowp',
      stencil: false
    });
    this._renderer.setClearColor('#FFFFFF');
    this._renderer.localClippingEnabled = true;
    this.renderTarget = new THREE.WebGLRenderTarget(renderSize.width, renderSize.height, {
      generateMipmaps: false,
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      stencilBuffer: true
    });
    this._renderer.setRenderTarget(this.renderTarget);
  }

  get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }

  createDebugCanvas(options?: { width: number; height: number }): HTMLCanvasElement {
    if (this.debugRenderer) {
      throw new Error('createDebugCanvas() can only be called once');
    }
    const width = options ? options.width : this.renderTarget.width;
    const height = options ? options.height : this.renderTarget.height;

    this.debugRenderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      stencil: false
    });
    this.debugRenderer.setClearColor('white');
    this.debugRenderer.setSize(width, height);

    return this.debugRenderer.domElement;
  }

  setModels(models: CadModelMetadata[]) {
    const keepModelIdentifiers = new Set<string>();
    for (const model of models) {
      const blobUrl = model.blobUrl;
      keepModelIdentifiers.add(blobUrl);
      if (!this.containers.has(blobUrl)) {
        this.addModel(model);
      }
    }

    const allIdentifiers = new Set<string>(this.containers.keys());
    const discardIdentifiers = new Set([...allIdentifiers].filter(x => !keepModelIdentifiers.has(x)));
    for (const modelIdentifier of discardIdentifiers) {
      this.removeModel(modelIdentifier);
    }
  }

  orderSectorsByVisibility(camera: THREE.Camera, clippingPlanes: THREE.Plane[]): PrioritizedSectorIdentifier[] {
    console.log('numplanes: ' + clippingPlanes.length);
    // this._renderer.clippingPlanes = [new THREE.Plane()];
    // coverageMaterial.clippingPlanes = clippingPlanes;
    // 1. Render to offscreen buffer
    this._renderer.render(this.scene, camera);
    if (this.debugRenderer) {
      this.debugRenderer.render(this.scene, camera);
    }

    // 2. Prepare buffer for reading from GPU
    this.prepareBuffers();

    // 3. Read back result from GPU
    this._renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      this.renderTarget.width,
      this.renderTarget.height,
      this.buffers.rtBuffer
    );

    // 4. Unpack GPU result to something more convinient
    const sectorVisibility = this.unpackSectorVisibility(
      this.renderTarget.width,
      this.renderTarget.height,
      this.buffers.rtBuffer
    );

    // 5. Map to IDs that the world understands
    const totalHits = sectorVisibility.reduce((hits, x) => x.hitCount + hits, 0);
    const result = sectorVisibility
      .filter(x => x.hitCount > 0)
      // Sort by "hit" to put most visible sectors first
      .sort((left, right) => {
        if (left && right) {
          return right.hitCount - left.hitCount;
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
          priority: x.hitCount / totalHits,
          depth: x.distance
        };
      });

    return result;
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
    const mesh = this.createSectorTreeMesh(this.sectorIdOffset, sectors, model.modelTransformation);
    this.containers.set(model.blobUrl, {
      model,
      sectors,
      sectorIdOffset: this.sectorIdOffset,
      renderable: mesh
    });
    this.sectorIdOffset += sectors.length;
    this.scene.add(mesh);
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
    const sectorVisibility = this.buffers.sectorVisibilityBuffer;
    for (let i = 0; i < renderTargetWidth * renderTargetHeight; i++) {
      const r = renderTargetBuffer[4 * i + 0];
      const g = renderTargetBuffer[4 * i + 1];
      const b = renderTargetBuffer[4 * i + 2];
      const distance = renderTargetBuffer[4 * i + 3]; // Distance stored in alpha
      if (r !== 255 || g !== 255 || b !== 255) {
        const sectorIdWithOffset = b + g * 255 + r * 255 * 255;
        const value = sectorVisibility[sectorIdWithOffset] || { sectorIdWithOffset, hitCount: 0, distance };
        value.hitCount++;
        value.distance = Math.min(value.distance, distance);
        sectorVisibility[sectorIdWithOffset] = value;
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
        entry.hitCount = 0;
      }
    }
  }

  private createSectorTreeMesh(
    sectorIdOffset: number,
    sectors: SectorMetadata[],
    modelTransformation: SectorModelTransformation
  ): THREE.Object3D {
    const transformMatrix = toThreeMatrix4(modelTransformation.modelMatrix);
    const group = new THREE.Group();
    group.applyMatrix4(transformMatrix);

    const sectorCount = sectors.length;

    const instanceValues = new Float32Array(4 * sectorCount); // sectorId, coverageFactor[3]
    const boxGeometry = new THREE.BoxBufferGeometry();
    const mesh = new THREE.InstancedMesh(boxGeometry, coverageMaterial, sectorCount);

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
