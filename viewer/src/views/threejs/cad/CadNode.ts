/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { vec3, mat4 } from 'gl-matrix';

import {
  SectorModelTransformation,
  SectorScene,
  SectorMetadata,
  WantedSectors,
  SectorQuads,
  Sector
} from '../../../models/cad/types';
import { defaultDetermineSectors } from '../../../models/cad/determineSectors';
import { DetermineSectorsDelegate } from '../../../models/cad/delegates';
import { CadLoadingHints } from '../../../models/cad/CadLoadingHints';
import { CadModel } from '../../../models/cad/CadModel';
import { CadRenderHints } from '../../CadRenderHints';
import { suggestCameraConfig } from '../../../utils/cameraUtils';
import { SectorNode } from './SectorNode';
import { fromThreeVector3, fromThreeMatrix, toThreeJsBox3, toThreeVector3, toThreeMatrix4 } from '../utilities';
import { RenderMode } from '../materials';
import { Shading, createDefaultShading } from './shading';
import { RootSectorNode } from './RootSectorNode';
import { BasicSectorActivator, SectorActivator } from '../../../models/cad/BasicSectorActivator';
import { CachedRepository } from '../../../repository/cad/CachedRepository';
import { Repository } from '../../../repository/cad/Repository';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { consumeSectorSimple } from './consumeSectorSimple';
import { MemoryRequestCache } from '../../../cache/MemoryRequestCache';
import { Observable, of, merge, Subject, pipe, GroupedObservable, OperatorFunction, empty } from 'rxjs';
import {
  flatMap,
  map,
  groupBy,
  distinctUntilKeyChanged,
  mergeMap,
  filter,
  publish,
  withLatestFrom,
  share,
  auditTime,
  switchAll
} from 'rxjs/operators';
import { LevelOfDetail } from '../../../data/model/LevelOfDetail';
import { ParsedSector } from '../../../data/model/ParsedSector';
import { WantedSector } from '../../../data/model/WantedSector';

interface CadNodeOptions {
  shading?: Shading;
}

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

const updateVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

interface ParsedSectorSimple {
  id: number;
  simpleData: SectorQuads;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}

interface ParsedSectorDetailed {
  id: number;
  detailedData: Sector;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}

interface ConsumedSector {
  id: number;
  levelOfDetail: LevelOfDetail;
  group: THREE.Group;
  metadata: SectorMetadata;
}

export class CadNode extends THREE.Object3D {
  public readonly rootSector: SectorNode;
  public readonly modelTransformation: SectorModelTransformation;

  private _determineSectors: DetermineSectorsDelegate;
  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;
  private _renderMode: RenderMode;

  private readonly _cameraPositionObservable: Subject<THREE.PerspectiveCamera>;
  private readonly _shading: Shading;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _boundingBoxNode: THREE.Object3D;
  private readonly _repository: Repository;

  constructor(model: CadModel, options?: CadNodeOptions) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';

    this._shading = (() => {
      if (options && options.shading) {
        return options.shading;
      }
      return createDefaultShading({
        color(_treeIndex: number) {
          return undefined;
        }
      });
    })();

    const rootSector = new RootSectorNode(model, this._shading);
    this._repository = new CachedRepository(model);

    const { scene, modelTransformation } = model;

    this._sectorScene = scene;
    this._determineSectors = defaultDetermineSectors;
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // Prepare renderables
    this.rootSector = rootSector;
    this.add(rootSector);
    this._boundingBoxNode = this.createBoundingBoxNode(scene.sectors);
    this.add(this._boundingBoxNode);

    // Apply default hints
    this._renderHints = {};
    this._loadingHints = {};
    this._renderMode = RenderMode.Color;
    this.renderHints = {};
    this.loadingHints = {};
    this.renderMode = RenderMode.Color;

    const indices = [];
    for (let i = 0; i < 100; i++) {
      indices.push(i);
    }

    this._shading.updateNodes(indices);

    // ======== NEW STUFF ======
    this._cameraPositionObservable = new Subject();

    const determineSectors = map((camera: THREE.PerspectiveCamera) => {
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      const { cameraPosition, cameraModelMatrix, projectionMatrix } = updateVars;
      fromThreeVector3(cameraPosition, camera.position, model.modelTransformation);
      fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, model.modelTransformation);
      fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
      const wantedSectors = this._determineSectors({
        scene: model.scene,
        cameraFov: camera.fov,
        cameraPosition,
        cameraModelMatrix,
        projectionMatrix,
        loadingHints: {}
      });
      const actualWantedSectors: WantedSector[] = [];
      for (const sector of wantedSectors.simple) {
        actualWantedSectors.push({
          id: sector,
          levelOfDetail: LevelOfDetail.Simple,
          metadata: model.scene.sectors.get(sector)!
        });
      }
      for (const sector of wantedSectors.detailed) {
        actualWantedSectors.push({
          id: sector,
          levelOfDetail: LevelOfDetail.Detailed,
          metadata: model.scene.sectors.get(sector)!
        });
      }
      for (const [id, sector] of model.scene.sectors) {
        if (!wantedSectors.simple.has(sector.id) && !wantedSectors.detailed.has(sector.id)) {
          actualWantedSectors.push({
            id: sector.id,
            levelOfDetail: LevelOfDetail.Discarded,
            metadata: sector
          });
        }
      }
      if (this.shouldRenderSectorBoundingBoxes) {
        this.updateSectorBoundingBoxes(wantedSectors);
      }
      return actualWantedSectors;
    });

    const distinctUntilLodChanged = pipe(
      groupBy((sector: WantedSector) => sector.id),
      mergeMap((group: GroupedObservable<number, WantedSector>) => group.pipe(distinctUntilKeyChanged('levelOfDetail')))
    );

    function dropOutdated(wantedObservable: Observable<WantedSector[]>): OperatorFunction<ParsedSector, ParsedSector> {
      return pipe(
        withLatestFrom(wantedObservable),
        flatMap(([loaded, wanted]) => {
          for (const wantedSector of wanted) {
            if (loaded.id === wantedSector.id && loaded.levelOfDetail === wantedSector.levelOfDetail) {
              return of(loaded);
            }
          }
          return empty();
        })
      );
    }

    const consumeSector = (id: number, sector: ParsedSector) => {
      const { levelOfDetail, metadata, data } = sector;
      const group = ((): THREE.Group => {
        switch (levelOfDetail) {
          case LevelOfDetail.Discarded: {
            return new THREE.Group();
          }
          case LevelOfDetail.Simple: {
            return consumeSectorSimple(id, data as SectorQuads, metadata, rootSector.shading.materials);
          }
          case LevelOfDetail.Detailed: {
            return consumeSectorDetailed(id, data as Sector, metadata, rootSector.shading.materials);
          }
          default:
            throw new Error(`Unsupported level of detail ${sector.levelOfDetail}`);
        }
      })();
      return group;
    };

    const consumeSectorCache = new MemoryRequestCache<number, ParsedSector, THREE.Group>(consumeSector);

    // TODO this should not have to be async, but the cache requires it
    const consume = async (id: number, sector: ParsedSector): Promise<ConsumedSector> => {
      const { levelOfDetail, metadata } = sector;
      const group = consumeSectorCache.request(id, sector);

      return {
        id,
        levelOfDetail,
        metadata,
        group
      };
    };

    this._cameraPositionObservable
      .pipe(
        auditTime(100),
        determineSectors,
        share(),
        publish(wantedSectors =>
          wantedSectors.pipe(
            switchAll(),
            distinctUntilLodChanged,
            this._repository.getSector,
            dropOutdated(wantedSectors),
            flatMap((sector: ParsedSector) => consume(sector.id, sector))
          )
        )
      )
      .subscribe((sector: ConsumedSector) => {
        const sectorNode = rootSector.sectorNodeMap.get(sector.id);
        if (!sectorNode) {
          throw new Error(`Could not find 3D node for sector ${sector.id} - invalid id?`);
        }
        if (sectorNode.group) {
          sectorNode.remove(sectorNode.group);
        }
        sectorNode.add(sector.group);
        sectorNode.group = sector.group;
        this.dispatchEvent({ type: 'update' });
      });
  }

  set renderMode(mode: RenderMode) {
    this._renderMode = mode;
    this._shading.materials.box.uniforms.renderMode.value = mode;
    this._shading.materials.circle.uniforms.renderMode.value = mode;
    this._shading.materials.generalRing.uniforms.renderMode.value = mode;
    this._shading.materials.nut.uniforms.renderMode.value = mode;
    this._shading.materials.quad.uniforms.renderMode.value = mode;
    this._shading.materials.cone.uniforms.renderMode.value = mode;
    this._shading.materials.eccentricCone.uniforms.renderMode.value = mode;
    this._shading.materials.sphericalSegment.uniforms.renderMode.value = mode;
    this._shading.materials.torusSegment.uniforms.renderMode.value = mode;
    this._shading.materials.generalCylinder.uniforms.renderMode.value = mode;
    this._shading.materials.trapezium.uniforms.renderMode.value = mode;
    this._shading.materials.ellipsoidSegment.uniforms.renderMode.value = mode;
    this._shading.materials.instancedMesh.uniforms.renderMode.value = mode;
    this._shading.materials.triangleMesh.uniforms.renderMode.value = mode;
    this._shading.materials.simple.uniforms.renderMode.value = mode;
  }

  get renderMode() {
    return this._renderMode;
  }

  set renderHints(hints: Readonly<CadRenderHints>) {
    this._renderHints = hints;
    this._boundingBoxNode.visible = this.shouldRenderSectorBoundingBoxes;
  }

  get renderHints(): Readonly<CadRenderHints> {
    return this._renderHints;
  }

  set loadingHints(hints: Readonly<CadLoadingHints>) {
    this._loadingHints = hints;
  }

  get loadingHints(): Readonly<CadLoadingHints> {
    return this._loadingHints;
  }

  set determineSectors(determineSectors: DetermineSectorsDelegate) {
    this._determineSectors = determineSectors;
  }

  get determineSectors() {
    return this._determineSectors;
  }

  private get shouldRenderSectorBoundingBoxes(): boolean {
    return this._renderHints.showSectorBoundingBoxes || false;
  }

  public update(camera: THREE.PerspectiveCamera) {
    this._cameraPositionObservable.next(camera);
  }

  public suggestCameraConfig(): SuggestedCameraConfig {
    const { position, target, near, far } = suggestCameraConfig(this._sectorScene.root);

    return {
      position: toThreeVector3(new THREE.Vector3(), position, this.modelTransformation),
      target: toThreeVector3(new THREE.Vector3(), target, this.modelTransformation),
      near,
      far
    };
  }

  private updateSectorBoundingBoxes(wantedSectors: WantedSectors) {
    this._boundingBoxNode.children.forEach(x => {
      const sectorId = x.userData.sectorId as number;
      const boxHelper = x as THREE.Box3Helper;
      boxHelper.visible = wantedSectors.detailed.has(sectorId) || wantedSectors.simple.has(sectorId);
    });
  }

  private createBoundingBoxNode(sectors: Map<number, SectorMetadata>): THREE.Object3D {
    function sectorDepth(s: SectorMetadata) {
      return s.path.length / 2; // Path are on format 'x/y/z/'
    }

    const maxColorDepth = [...sectors.values()].reduce((max, s) => Math.max(max, sectorDepth(s)), 0.0);
    const from = new THREE.Color(0xff0000);
    const to = new THREE.Color(0x00ff00);
    const colors = [...Array(maxColorDepth).keys()].map(d => {
      const color = new THREE.Color().copy(from);
      color.lerpHSL(to, d / (maxColorDepth - 1));
      return color;
    });

    const boxesNode = new THREE.Group();
    boxesNode.applyMatrix4(toThreeMatrix4(this.modelTransformation.modelMatrix));
    boxesNode.name = 'Bounding boxes (for debugging)';
    sectors.forEach(sector => {
      const bbox = toThreeJsBox3(new THREE.Box3(), sector.bounds);
      const color = colors[sectorDepth(sector)];
      const boxMesh = new THREE.Box3Helper(bbox, color);
      boxMesh.name = `${sector.id}`;
      boxMesh.userData.sectorId = sector.id;
      boxesNode.add(boxMesh);
    });
    return boxesNode;
  }
}
