/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { SectorModelTransformation, SectorScene, SectorMetadata, WantedSectors } from '../../../models/sector/types';
import { fromThreeVector3, fromThreeMatrix, toThreeMatrix4, toThreeJsBox3 } from '../utilities';
import { SectorActivator } from '../../../models/sector/initializeSectorLoader';
import { DetermineSectorsDelegate } from '../../../models/sector/delegates';
import { vec3, mat4 } from 'gl-matrix';
import { SectorRenderStyle } from '../../SectorRenderStyle';
import { CadLoadingStyle } from '../../../models/sector/CadLoadingStyle';

export class SectorNode extends THREE.Group {
  public readonly sectorId: number;

  constructor(sectorId: number, sectorPath: string) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
  }
}

const updateVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

export class RootSectorNode extends SectorNode {
  public readonly modelTransformation: SectorModelTransformation;

  private _determineSectors: DetermineSectorsDelegate;
  private _simpleActivator: SectorActivator;
  private _detailedActivator: SectorActivator;
  private _renderStyle: SectorRenderStyle;
  private _loadingStyle: CadLoadingStyle;

  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _boundingBoxNode: THREE.Object3D;

  constructor(
    sectorScene: SectorScene,
    modelTransformation: SectorModelTransformation,
    determineSectors: DetermineSectorsDelegate,
    simpleActivator: SectorActivator,
    detailedActivator: SectorActivator
  ) {
    super(0, '/');
    this.name = 'Sector model';
    this._sectorScene = sectorScene;
    this._determineSectors = determineSectors;
    this._simpleActivator = simpleActivator;
    this._detailedActivator = detailedActivator;
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;
    // Apply model matrix to this model
    this.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));

    this._boundingBoxNode = this.createBoundingBoxNode(sectorScene.sectors);
    this.add(this._boundingBoxNode);

    // Apply default styles
    this._renderStyle = {};
    this._loadingStyle = {};
    this.renderStyle = {};
    this.loadingStyle = {};
  }

  set renderStyle(style: Readonly<SectorRenderStyle>) {
    this._renderStyle = style;
    this._boundingBoxNode.visible = this.shouldRenderSectorBoundingBoxes;
  }

  get renderStyle(): Readonly<SectorRenderStyle> {
    return this._renderStyle;
  }

  set loadingStyle(style: Readonly<CadLoadingStyle>) {
    this._loadingStyle = style;
  }

  get loadingStyle(): Readonly<CadLoadingStyle> {
    return this._loadingStyle;
  }

  set determineSectors(determineSectors: DetermineSectorsDelegate) {
    this._determineSectors = determineSectors;
  }

  get determineSectors() {
    return this._determineSectors;
  }

  private get shouldRenderSectorBoundingBoxes(): boolean {
    return this._renderStyle.showSectorBoundingBoxes || false;
  }

  public async update(camera: THREE.PerspectiveCamera): Promise<boolean> {
    let needsRedraw = false;
    const { cameraPosition, cameraModelMatrix, projectionMatrix } = updateVars;
    if (!this._previousCameraMatrix.equals(camera.matrixWorld)) {
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      fromThreeVector3(cameraPosition, camera.position, this.modelTransformation);
      fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, this.modelTransformation);
      fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
      const wantedSectors = await this._determineSectors({
        scene: this._sectorScene,
        cameraFov: camera.fov,
        cameraPosition,
        cameraModelMatrix,
        projectionMatrix,
        loadingStyle: this.loadingStyle
      });
      needsRedraw = this._detailedActivator.update(wantedSectors.detailed) || needsRedraw;
      needsRedraw = this._simpleActivator.update(wantedSectors.simple) || needsRedraw;

      if (this.shouldRenderSectorBoundingBoxes) {
        this.updateSectorBoundingBoxes(wantedSectors);
      }

      this._previousCameraMatrix.copy(camera.matrixWorld);
    }
    needsRedraw = this._detailedActivator.refresh() || needsRedraw;
    needsRedraw = this._simpleActivator.refresh() || needsRedraw;
    return needsRedraw;
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
    boxesNode.name = 'Bounding boxes (for debugging)';
    sectors.forEach(sector => {
      const bbox = toThreeJsBox3(sector.bounds);
      const color = colors[sectorDepth(sector)];
      const boxMesh = new THREE.Box3Helper(bbox, color);
      boxMesh.name = `${sector.id}`;
      boxMesh.userData.sectorId = sector.id;
      boxesNode.add(boxMesh);
    });
    return boxesNode;
  }
}
