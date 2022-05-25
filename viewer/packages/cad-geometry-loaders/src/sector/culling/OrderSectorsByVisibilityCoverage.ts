/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { WebGLRendererStateHelper } from '@reveal/utilities';
import { CadModelMetadata, V8SectorMetadata, WantedSector } from '@reveal/cad-parsers';
import { coverageShaders, CadGeometryRenderModePipelineProvider } from '@reveal/rendering';

import assert from 'assert';
import { RenderAlreadyLoadedGeometryProvider } from './RenderAlreadyLoadedGeometryProvider';

type SectorContainer = {
  model: CadModelMetadata;
  sectors: V8SectorMetadata[];
  // Index is sectorId, value is sectorIndex
  sectorIndexById: number[];
  sectorIdOffset: number;
  lastSectorIdWithOffset: number;
  renderable: THREE.Object3D;
  attributesBuffer: THREE.InstancedInterleavedBuffer;
  attributesValues: Float32Array;
  mesh: THREE.Mesh;
};

type SectorVisibility = {
  sectorIdWithOffset: number;
  weight: number;
  distance: number;
};

function nullSectorVisibility(): SectorVisibility {
  return {
    sectorIdWithOffset: -1,
    weight: -1,
    distance: Infinity
  };
}

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
   * GeometryDepthRenderPipeline used to initialize the RenderAlreadyLoadedGeometryProvider
   */
  depthOnlyRenderPipeline: CadGeometryRenderModePipelineProvider;
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
   */
  setClipping(planes: THREE.Plane[] | null): void;

  /**
   * Cull a set of sectors potentially being loaded towards already loaded geometry to determine if
   * the sector is visible or occluded.
   */
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
  /**
   * Factor of how big render target we use for determining visibility of sectors
   * compared to the full render size.
   */
  private static readonly CoverageRenderTargetScalingFactor = 1.0 / 2.0;

  private sectorIdOffset = 0;
  private readonly scene = new THREE.Scene();
  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _alreadyLoadedProvider: RenderAlreadyLoadedGeometryProvider;
  private _debugImageElement?: HTMLImageElement;
  private readonly renderTarget: THREE.WebGLRenderTarget;
  private readonly containers: Map<string, SectorContainer> = new Map();
  private readonly buffers = {
    size: new THREE.Vector2(),
    rtBuffer: new Uint8Array(),
    sectorVisibilityBuffer: [] as SectorVisibility[]
  };

  private readonly coverageMaterial = new THREE.RawShaderMaterial({
    vertexShader: coverageShaders.vertex,
    fragmentShader: coverageShaders.fragment,
    clipping: true,
    side: THREE.DoubleSide,
    uniforms: {
      instanceMatrix: {
        value: new THREE.Matrix4()
      }
    },
    glslVersion: THREE.GLSL3
  });

  constructor(options: OrderSectorsByVisibleCoverageOptions) {
    this._renderer = options.renderer;
    this._alreadyLoadedProvider = new RenderAlreadyLoadedGeometryProvider(
      options.renderer,
      options.depthOnlyRenderPipeline
    );

    // Note! Rener target will be resize before actual use
    this.renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      generateMipmaps: false,
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    });
  }

  dispose(): void {
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

  setModels(models: CadModelMetadata[]): void {
    const keepModelIdentifiers = new Set<string>();
    for (const model of models) {
      const modelIdentifier = model.modelIdentifier;
      keepModelIdentifiers.add(modelIdentifier);
      const container = this.containers.get(modelIdentifier);
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

  setClipping(planes: THREE.Plane[] | null): void {
    this.coverageMaterial.clippingPlanes = planes;
  }

  cullOccludedSectors(camera: THREE.PerspectiveCamera, sectors: WantedSector[]): WantedSector[] {
    try {
      // Only render sectors we are interested in
      this.setAllSectorsVisible(false);
      this.setSectorsVisibility(sectors, true);

      const ordered = this.orderSectorsByVisibility(camera);
      const filtered = sectors.filter(toBeFiltered => {
        const container = this.containers.get(toBeFiltered.modelIdentifier);
        if (container === undefined) {
          throw new Error(`Model ${toBeFiltered.modelIdentifier} is not registered`);
        }
        const metadata = toBeFiltered.metadata as V8SectorMetadata;
        assert(metadata !== undefined, `${metadata} is not of type supported type V8SectorMetadata`);

        const isCameraInsideSector = isWithinSectorBounds(container.model, metadata, camera.position);
        // Note! O(N), but N is number of input sectors (i.e. low)
        const found = ordered.some(
          x => x.model.modelIdentifier === toBeFiltered.modelIdentifier && x.sectorId === toBeFiltered.metadata.id
        );
        return found || isCameraInsideSector;
      });
      return filtered;
    } finally {
      this.setAllSectorsVisible(true);
    }
  }

  orderSectorsByVisibility(camera: THREE.PerspectiveCamera): PrioritizedSectorIdentifier[] {
    if (this._debugImageElement) {
      this.renderSectors(null, camera);
      this._debugImageElement.src = this._renderer.domElement.toDataURL();
    }

    this.ensureBuffersCorrectSize();
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

  private readonly _ensureBuffersCorrectSizeVars = {
    size: new THREE.Vector2()
  };

  private ensureBuffersCorrectSize() {
    const { size } = this._ensureBuffersCorrectSizeVars;
    this._renderer.getSize(size);

    if (!this.buffers.size.equals(size)) {
      const rtWidth = Math.max(
        Math.floor(size.width * GpuOrderSectorsByVisibilityCoverage.CoverageRenderTargetScalingFactor),
        64
      );
      const rtHeight = Math.max(
        Math.floor(size.height * GpuOrderSectorsByVisibilityCoverage.CoverageRenderTargetScalingFactor),
        64
      );
      this.renderTarget.setSize(rtWidth, rtHeight);

      // Ensure buffer can hold all pixels from render target
      if (this.buffers.rtBuffer.length < 4 * rtWidth * rtHeight) {
        this.buffers.rtBuffer = new Uint8Array(4 * rtWidth * rtHeight);
      }

      this.buffers.size.copy(size);
    }
  }

  private renderSectors(renderTarget: THREE.WebGLRenderTarget | null, camera: THREE.PerspectiveCamera): void {
    const stateHelper = new WebGLRendererStateHelper(this._renderer);
    try {
      stateHelper.localClippingEnabled = true;
      stateHelper.setRenderTarget(renderTarget);
      stateHelper.setClearColor('#FFFFFF', 1.0);
      stateHelper.autoClear = false;
      stateHelper.setSize(this.buffers.size.width, this.buffers.size.height);

      // 1. Clear render target (depth + color)
      this._renderer.clear(true, true);

      // 2. Render already loaded geometry to offscreen buffer
      this._alreadyLoadedProvider.renderOccludingGeometry(renderTarget, camera);

      // 3. Render to offscreen buffer
      this._renderer.render(this.scene, camera);
    } finally {
      stateHelper.resetState();
    }
  }

  private setAllSectorsVisible(visible: boolean) {
    const visibilityValue = visible ? 1.0 : 0.0;
    this.containers.forEach(container => {
      for (let i = 0; i < container.sectors.length; ++i) {
        const id = container.sectors[i].id;
        const index = container.sectorIndexById[id];
        container.attributesValues[5 * index + 4] = visibilityValue;
      }
      container.attributesBuffer.needsUpdate = true;
    });
  }

  private setSectorsVisibility(sectors: WantedSector[], visible: boolean) {
    const visibilityValue = visible ? 1.0 : 0.0;
    sectors.forEach(s => {
      const id = s.metadata.id;
      const container = this.containers.get(s.modelIdentifier);
      if (container === undefined) {
        throw new Error(`Sector ${s} is from a model not added`);
      }
      const index = container.sectorIndexById[id];
      container.attributesValues[5 * index + 4] = visibilityValue;
      container.attributesBuffer.needsUpdate = true;
    });
  }

  private removeModel(modelIdentifier: string) {
    const container = this.containers.get(modelIdentifier);
    if (!container) {
      throw new Error(`Could not find model '${modelIdentifier}'`);
    }
    container.mesh.geometry.dispose();
    this.deleteSectorsFromBuffers(container.sectorIdOffset, container.lastSectorIdWithOffset);
    this.scene.remove(container.renderable);
    this.containers.delete(modelIdentifier);
  }

  private deleteSectorsFromBuffers(firstSectorId: number, lastSectorId: number) {
    const sectorVisibility = this.buffers.sectorVisibilityBuffer;
    for (let i = firstSectorId; i <= lastSectorId; ++i) {
      sectorVisibility[i] = nullSectorVisibility();
    }
  }

  private addModel(model: CadModelMetadata) {
    const sectors = model.scene.getAllSectors().map(p => p as V8SectorMetadata);
    const [mesh, attributesBuffer, attributesValues] = this.createSectorTreeGeometry(this.sectorIdOffset, sectors);

    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    group.applyMatrix4(model.modelMatrix);
    group.updateMatrixWorld();
    group.add(mesh);

    const maxSectorId = sectors.reduce((max, sector) => Math.max(sector.id, max), 0);
    const sectorIndexById = new Array<number>(maxSectorId);
    sectors.forEach((x, index) => (sectorIndexById[x.id] = index));
    this.containers.set(model.modelIdentifier, {
      model,
      sectors,
      sectorIndexById,
      sectorIdOffset: this.sectorIdOffset,
      lastSectorIdWithOffset: this.sectorIdOffset + maxSectorId,
      renderable: group,
      mesh,
      attributesBuffer,
      attributesValues
    });
    this.sectorIdOffset += maxSectorId + 1;
    this.scene.add(group);
  }

  private updateModel(container: SectorContainer, model: CadModelMetadata) {
    container.renderable.matrix.copy(model.modelMatrix);
    container.renderable.updateMatrixWorld(true);
  }

  private findSectorContainer(sectorIdWithOffset: number): SectorContainer {
    for (const container of this.containers.values()) {
      if (sectorIdWithOffset >= container.sectorIdOffset && sectorIdWithOffset <= container.lastSectorIdWithOffset) {
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
    resetVisibilityInformation(sectorVisibility);
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
          const rx = (x - halfWidth) / halfWidth;

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

  private createSectorTreeGeometry(
    sectorIdOffset: number,
    sectors: V8SectorMetadata[]
  ): [THREE.Mesh, THREE.InstancedInterleavedBuffer, Float32Array] {
    const translation = new THREE.Vector3();
    const scale = new THREE.Vector3();

    const sectorCount = sectors.length;
    const instanceValues = new Float32Array(5 * sectorCount); // sectorId, coverageFactor[3], visibility
    const boxGeometry = new THREE.BoxBufferGeometry();
    const mesh = new THREE.InstancedMesh(boxGeometry, this.coverageMaterial, sectorCount);

    const addSector = (sectorBounds: THREE.Box3, sectorIndex: number, sectorId: number, coverage: THREE.Vector3) => {
      sectorBounds.getCenter(translation);
      sectorBounds.getSize(scale);

      const instanceMatrix = new THREE.Matrix4().compose(translation, identityRotation, scale);
      mesh.setMatrixAt(sectorIndex, instanceMatrix);
      instanceValues[5 * sectorIndex + 0] = sectorIdOffset + sectorId;
      instanceValues[5 * sectorIndex + 1] = coverage.x;
      instanceValues[5 * sectorIndex + 2] = coverage.y;
      instanceValues[5 * sectorIndex + 3] = coverage.z;
      instanceValues[5 * sectorIndex + 4] = 1.0; // visible
    };

    const coverageFactors = new THREE.Vector3(); // Allocate once only
    sectors.forEach((sector, sectorIndex) => {
      // Note! We always use the 'high detail' coverage factors, not recursiveCoverageFactors because we
      // don't know what detail level a sector will be loaded in. A better approach might be to choose this
      // runtime (either before rendering or in shader), but not sure how to solve this. -lars 2020-04-22
      const { xy, xz, yz } = sector.facesFile!.coverageFactors;
      coverageFactors.set(yz, xz, xy);
      addSector(sector.subtreeBoundingBox, sectorIndex, sector.id, coverageFactors);
    });

    const buffer = new THREE.InstancedInterleavedBuffer(instanceValues, 5);
    boxGeometry.setAttribute('a_sectorId', new THREE.InterleavedBufferAttribute(buffer, 1, 0));
    boxGeometry.setAttribute('a_coverageFactor', new THREE.InterleavedBufferAttribute(buffer, 3, 1));
    boxGeometry.setAttribute('a_visible', new THREE.InterleavedBufferAttribute(buffer, 1, 4));

    return [mesh, buffer, instanceValues];
  }
}

const isCameraInsideSectorVars = {
  sectorBounds: new THREE.Box3()
};

function isWithinSectorBounds(model: CadModelMetadata, metadata: V8SectorMetadata, point: THREE.Vector3) {
  const { sectorBounds } = isCameraInsideSectorVars;
  sectorBounds.copy(metadata.subtreeBoundingBox);
  sectorBounds.applyMatrix4(model.modelMatrix);
  return sectorBounds.containsPoint(point);
}

function resetVisibilityInformation(sectorVisibility: SectorVisibility[]) {
  // Blank visibility information
  for (let i = 0; i < sectorVisibility.length; i++) {
    const entry = sectorVisibility[i];
    if (entry) {
      entry.weight = 0;
    }
  }
}
