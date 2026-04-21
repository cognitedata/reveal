/*!
 * Copyright 2026 Cognite AS
 */

import {
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Texture,
  Vector3
} from 'three';
import { SceneHandler } from '@reveal/utilities';
import { Overlay3DIcon } from '@reveal/3d-overlays';

/**
 * Manages two floor disc meshes (same level, elevated) and the floor hover mesh.
 * Encapsulates all per-frame instance placement and elevation routing.
 */
export class FlooredIconManager {
  /** Total downward offset from icon/camera position to floor disc. */
  public static readonly FloorDiscHeightOffset = 1.45;
  /** Height difference (metres) within which two stations are considered on the same floor. */
  private static readonly FloorLevelThreshold = 1.0;
  /** Max icons shown for elevated (above + below combined) to avoid visual clutter. */
  private static readonly ElevatedIconLimit = 6;

  private readonly _floorDiscMeshSameLevel: InstancedMesh<CircleGeometry, MeshBasicMaterial>;
  private readonly _floorDiscMeshElevated: InstancedMesh<CircleGeometry, MeshBasicMaterial>;
  private readonly _hoverMesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  private readonly _hiddenMatrix = new Matrix4().makeScale(0, 0, 0);
  private readonly _sceneHandler: SceneHandler;
  private readonly _elevationTexture: CanvasTexture;
  private readonly _floorDiscMeshColor = 0xdddddd;

  private _activeFloorDiscCountSameLevel = 0;
  private _activeFloorDiscCountElevated = 0;
  private _referenceIcon: Overlay3DIcon | undefined;

  constructor(
    capacity: number,
    iconRadius: number,
    maxPixelSize: number,
    sameLevelTexture: Texture,
    hoverIconTexture: CanvasTexture,
    sceneHandler: SceneHandler
  ) {
    this._sceneHandler = sceneHandler;
    this._elevationTexture = FlooredIconManager.createElevationDiscTexture(maxPixelSize);

    this._floorDiscMeshSameLevel = this.createFloorDiscMesh(
      capacity,
      iconRadius,
      sameLevelTexture,
      this._floorDiscMeshColor
    );
    this._floorDiscMeshElevated = this.createFloorDiscMesh(
      FlooredIconManager.ElevatedIconLimit,
      iconRadius,
      this._elevationTexture,
      this._floorDiscMeshColor
    );
    this._hoverMesh = FlooredIconManager.createHoverMesh(iconRadius, hoverIconTexture);

    sceneHandler.addObject3D(this._floorDiscMeshSameLevel);
    sceneHandler.addObject3D(this._floorDiscMeshElevated);
    sceneHandler.addObject3D(this._hoverMesh);
  }

  public set hoverVisible(value: boolean) {
    this._hoverMesh.visible = value;
  }

  public showMeshes(): void {
    this._floorDiscMeshSameLevel.visible = true;
    this._floorDiscMeshElevated.visible = true;
  }

  public hideMeshesAndClearInstances(): void {
    this._floorDiscMeshSameLevel.visible = false;
    this._floorDiscMeshElevated.visible = false;
    this.clearMeshInstances(this._floorDiscMeshSameLevel, this._activeFloorDiscCountSameLevel);
    this.clearMeshInstances(this._floorDiscMeshElevated, this._activeFloorDiscCountElevated);
    this._activeFloorDiscCountSameLevel = 0;
    this._activeFloorDiscCountElevated = 0;
  }

  public update(icons: Overlay3DIcon[], collectionTransform: Matrix4): void {
    const worldPos = new Vector3();
    const tempMatrix = new Matrix4();

    let referenceWorldY: number | undefined;
    if (this._referenceIcon !== undefined) {
      referenceWorldY = this._referenceIcon.getPosition().clone().applyMatrix4(collectionTransform).y;
    }

    let sameLevelIdx = 0;
    let elevatedIdx = 0;
    for (const p of icons) {
      worldPos.copy(p.getPosition()).applyMatrix4(collectionTransform);
      tempMatrix.makeTranslation(worldPos.x, worldPos.y, worldPos.z);
      if (
        referenceWorldY === undefined ||
        Math.abs(worldPos.y - referenceWorldY) <= FlooredIconManager.FloorLevelThreshold
      ) {
        if (sameLevelIdx < this._floorDiscMeshSameLevel.count) {
          this._floorDiscMeshSameLevel.setMatrixAt(sameLevelIdx++, tempMatrix);
        }
      } else {
        if (elevatedIdx < FlooredIconManager.ElevatedIconLimit) {
          this._floorDiscMeshElevated.setMatrixAt(elevatedIdx++, tempMatrix);
        }
      }
    }

    this.finalizeMesh(this._floorDiscMeshSameLevel, sameLevelIdx, this._activeFloorDiscCountSameLevel);
    this.finalizeMesh(this._floorDiscMeshElevated, elevatedIdx, this._activeFloorDiscCountElevated);

    this._activeFloorDiscCountSameLevel = sameLevelIdx;
    this._activeFloorDiscCountElevated = elevatedIdx;
  }

  private finalizeMesh(
    mesh: InstancedMesh<CircleGeometry, MeshBasicMaterial>,
    newCount: number,
    prevCount: number
  ): void {
    for (let i = newCount; i < prevCount; i++) {
      mesh.setMatrixAt(i, this._hiddenMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (newCount !== prevCount) mesh.computeBoundingBox();
  }

  public setHoverPosition(worldPos: Vector3): void {
    this._hoverMesh.position.set(worldPos.x, worldPos.y, worldPos.z);
  }

  public setReferenceIcon(icon: Overlay3DIcon | undefined): void {
    this._referenceIcon = icon;
  }

  public setOpacity(value: number): void {
    this._floorDiscMeshSameLevel.material.opacity = value;
    this._floorDiscMeshElevated.material.opacity = value;
  }

  public setOccludedVisible(value: boolean): void {
    this._floorDiscMeshSameLevel.material.depthTest = value;
    this._floorDiscMeshElevated.material.depthTest = value;
  }

  public dispose(): void {
    this._sceneHandler.removeObject3D(this._floorDiscMeshSameLevel);
    this._floorDiscMeshSameLevel.geometry.dispose();
    this._floorDiscMeshSameLevel.material.dispose();

    this._sceneHandler.removeObject3D(this._floorDiscMeshElevated);
    this._floorDiscMeshElevated.geometry.dispose();
    this._floorDiscMeshElevated.material.dispose();

    this._elevationTexture.dispose();

    this._sceneHandler.removeObject3D(this._hoverMesh);
    this._hoverMesh.geometry.dispose();
    this._hoverMesh.material.dispose();
  }

  // ==================================================
  // PRIVATE METHODS
  // ==================================================

  private clearMeshInstances(mesh: InstancedMesh<CircleGeometry, MeshBasicMaterial>, count: number): void {
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, this._hiddenMatrix);
    }
    if (count > 0) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingBox();
    }
  }

  private createFloorDiscMesh(
    capacity: number,
    iconRadius: number,
    texture: Texture,
    color: number
  ): InstancedMesh<CircleGeometry, MeshBasicMaterial> {
    const geometry = new CircleGeometry(iconRadius, 32);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, -FlooredIconManager.FloorDiscHeightOffset, 0);
    const material = new MeshBasicMaterial({
      map: texture,
      color,
      opacity: 0.75,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide
    });
    const mesh = new InstancedMesh(geometry, material, capacity);
    mesh.visible = false;
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    for (let i = 0; i < capacity; i++) {
      mesh.setMatrixAt(i, this._hiddenMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingBox();
    return mesh;
  }

  private static createHoverMesh(iconRadius: number, texture: CanvasTexture): Mesh<BufferGeometry, MeshBasicMaterial> {
    const geometry = new CircleGeometry(iconRadius, 32);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, -FlooredIconManager.FloorDiscHeightOffset, 0);
    const mesh = new Mesh(
      geometry,
      new MeshBasicMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false, side: DoubleSide })
    );
    mesh.visible = false;
    mesh.renderOrder = 5;
    return mesh;
  }

  private static createElevationDiscTexture(maxPixelSize: number): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = maxPixelSize;
    canvas.height = maxPixelSize;
    const half = maxPixelSize * 0.5;
    const ctx = canvas.getContext('2d')!;

    const innerLineWidth = maxPixelSize / 8;
    const outerLineWidth = maxPixelSize / 16;
    ctx.beginPath();
    ctx.lineWidth = innerLineWidth;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.arc(half, half, half - innerLineWidth, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = outerLineWidth;
    ctx.strokeStyle = '#FFFFFF';
    ctx.arc(half, half, half - outerLineWidth / 2 - 2, 0, 2 * Math.PI);
    ctx.stroke();

    const centerRingRadius = maxPixelSize * 0.12;
    ctx.beginPath();
    ctx.lineWidth = maxPixelSize / 16;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.arc(half, half, centerRingRadius, 0, 2 * Math.PI);
    ctx.stroke();

    return new CanvasTexture(canvas);
  }
}
