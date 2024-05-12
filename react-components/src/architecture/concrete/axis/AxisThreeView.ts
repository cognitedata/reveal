/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/class-literal-property-style */
import {
  Mesh,
  type Object3D,
  LineSegments,
  LineBasicMaterial,
  Vector3,
  MeshBasicMaterial,
  type Color,
  BackSide,
  Box3,
  OrthographicCamera,
  BufferGeometry,
  BufferAttribute,
  type PerspectiveCamera
} from 'three';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { Range3 } from '../../base/utilities/geometry/Range3';
import { isRelEqual, isIncrement } from '../../base/utilities/extensions/mathExtensions';
import { Range1 } from '../../base/utilities/geometry/Range1';
import { type AxisRenderStyle } from './AxisRenderStyle';
import {
  createSpriteWithText,
  moveSpriteByPositionAndDirection
} from '../../base/utilities/sprites/createSprite';
import { TrianglesBuffers } from '../../base/utilities/geometry/TrianglesBuffers';
import { getCenter } from '../../base/utilities/extensions/vectorExtensions';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

const WALL_INDEX_NAME1 = 'wallIndex1';
const WALL_INDEX_NAME2 = 'wallIndex2';
const MAIN_AXIS_NAME = 'mainAxis';

export class AxisThreeView extends GroupThreeView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _corners: Vector3[];
  private readonly _faceCenters: Vector3[];
  private readonly _sceneBoundingBox: Box3 = new Box3().makeEmpty(); // Caching the bounding box of the scene
  private readonly _expandedSceneBoundingBox: Range3 = new Range3();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get style(): AxisRenderStyle {
    return super.style as AxisRenderStyle;
  }

  public constructor() {
    super();
    this._corners = new Array(8).fill(null).map(() => new Vector3());
    this._faceCenters = new Array(6).fill(null).map(() => new Vector3());
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (this.isEmpty) {
      return;
    }
    if (change.isChanged(Changes.renderStyle)) {
      this.removeChildren();
      this.invalidateBoundingBox();
      this.invalidateRenderTarget();
    }
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  public override beforeRender(camera: PerspectiveCamera): void {
    super.beforeRender(camera);
    if (this.isEmpty) {
      return;
    }
    let cameraDirection: Vector3 | undefined;
    let cameraPosition: Vector3 | undefined;

    if (camera instanceof OrthographicCamera) {
      cameraDirection = camera.getWorldDirection(new Vector3());
    } else {
      cameraPosition = camera.position;
    }
    for (const child of this.object.children) {
      this.updateVisibleAxis(child, cameraPosition, cameraDirection);
    }
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  public override get shouldPick(): boolean {
    return false;
  }

  public override get isPartOfBoundingBox(): boolean {
    return false;
  }

  protected override get needsUpdate(): boolean {
    const target = this.renderTarget;

    // Check if bounding box is different
    const sceneBoundingBox = target.sceneBoundingBox;
    const a = sceneBoundingBox.min.distanceTo(sceneBoundingBox.max);
    const b = this._sceneBoundingBox.min.distanceTo(this._sceneBoundingBox.max);
    if (isRelEqual(a, b, 0.075)) {
      return false;
    }
    if (sceneBoundingBox.equals(this._sceneBoundingBox)) {
      // Not working
      return false;
    }
    if (!sceneBoundingBox.isEmpty()) {
      sceneBoundingBox.expandByVector(sceneBoundingBox.getSize(new Vector3()).multiplyScalar(0.02));
    }
    this._sceneBoundingBox.copy(sceneBoundingBox);
    this._expandedSceneBoundingBox.copy(sceneBoundingBox);
    this._expandedSceneBoundingBox.expandByFraction(0.02);
    return true;
  }

  protected override addChildren(): void {
    const boundingBox = this._expandedSceneBoundingBox;
    if (boundingBox === undefined) {
      return;
    }
    if (boundingBox.isEmpty) {
      return;
    }
    const { style } = this;
    const tickLength = boundingBox.diagonal * style.tickLength;

    // Initialize the corners and the centers
    boundingBox.getCornerPoints(this._corners);
    const useWall = getUseWall(boundingBox);
    for (let wallIndex = 0; wallIndex < 6; wallIndex++) {
      const indexes = Range3.getWallCornerIndexes(wallIndex);
      const center = this._faceCenters[wallIndex];
      center.copy(this._corners[indexes[0]]);
      center.add(this._corners[indexes[1]]);
      center.add(this._corners[indexes[2]]);
      center.add(this._corners[indexes[3]]);
      center.divideScalar(4);
    }
    // Add Walls
    for (let wallIndex = 0; wallIndex < 6; wallIndex++) {
      this.addWall(style, useWall, wallIndex);
    }
    const increment = getGridInc(boundingBox, style.numTicks);
    if (boundingBox.x.hasSpan) {
      this.addAxis(style, useWall, increment, tickLength, 0, 1, 0, 1, 2);
      this.addAxis(style, useWall, increment, tickLength, 3, 2, 0, 2, 4);
      this.addAxis(style, useWall, increment, tickLength, 7, 6, 0, 4, 5);
      this.addAxis(style, useWall, increment, tickLength, 4, 5, 0, 1, 5);
    }
    // Add Y axis
    if (boundingBox.y.hasSpan) {
      this.addAxis(style, useWall, increment, tickLength, 3, 0, 1, 0, 2);
      this.addAxis(style, useWall, increment, tickLength, 1, 2, 1, 2, 3);
      this.addAxis(style, useWall, increment, tickLength, 5, 6, 1, 3, 5);
      this.addAxis(style, useWall, increment, tickLength, 7, 4, 1, 0, 5);
    }
    // Add Z axis
    if (boundingBox.z.hasSpan) {
      this.addAxis(style, useWall, increment, tickLength, 0, 4, 2, 0, 1);
      this.addAxis(style, useWall, increment, tickLength, 1, 5, 2, 1, 3);
      this.addAxis(style, useWall, increment, tickLength, 2, 6, 2, 3, 4);
      this.addAxis(style, useWall, increment, tickLength, 3, 7, 2, 0, 4);
    }

    // Add Grid
    if (style.showGrid) {
      this.addGrid(style, useWall, 0, increment, 1, 2);
      this.addGrid(style, useWall, 1, increment, 0, 2);
      this.addGrid(style, useWall, 2, increment, 0, 1);
      this.addGrid(style, useWall, 3, increment, 1, 2);
      this.addGrid(style, useWall, 4, increment, 0, 2);
      this.addGrid(style, useWall, 5, increment, 0, 1);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Add axis
  // ==================================================

  private addAxis(
    style: AxisRenderStyle,
    usedWall: boolean[],
    increment: number,
    tickLength: number,
    i0: number,
    i1: number,
    dimension: number,
    wallIndex1: number,
    wallIndex2: number
  ): void {
    if (!usedWall[wallIndex1] && !usedWall[wallIndex2]) {
      return;
    }
    // Draw axis
    if (style.showAxis) {
      for (let i = 0; i < 2; i++) {
        const isMainAxis = i === 0;
        const color = style.getAxisColor(isMainAxis, dimension);
        const linewidth = isMainAxis ? 2 : 1;
        const vertices: number[] = [];

        vertices.push(...this._corners[i0]);
        vertices.push(...this._corners[i1]);

        const lineSegments = createLineSegments(vertices, color, linewidth);
        this.setUserDataOnAxis(lineSegments, wallIndex1, wallIndex2, isMainAxis);
        this.addChild(lineSegments);
      }
    }
    {
      const range = new Range1(
        this._corners[i0].getComponent(dimension),
        this._corners[i1].getComponent(dimension)
      );
      if (range.isEmpty) {
        return;
      }
      let minLabelTick = 0;
      let labelCount = 0;

      // Draw ticks
      const labelInc = range.getBoldIncrement(increment);
      const tickDirection = Range3.getTickDirection(wallIndex1, wallIndex2);

      // Add tick marks and labels
      if (style.showAxisTicks || style.showAxisNumbers) {
        const vertices: number[] = [];
        const tickFontSize = style.tickFontSize * tickLength;
        for (const anyTick of range.getTicks(increment)) {
          const tick = Number(anyTick);
          const start = this._corners[i0].clone();
          start.setComponent(dimension, tick);

          const end = start.clone();
          const vector = tickDirection.clone();
          vector.multiplyScalar(tickLength);

          if (style.showAxisTicks) {
            end.add(vector);

            // Add tick mark
            vertices.push(...start);
            vertices.push(...end);
          }
          if (style.showAxisNumbers) {
            if (!isIncrement(tick, labelInc)) {
              continue;
            }
            if (labelCount === 0) {
              minLabelTick = tick;
            }
            labelCount += 1;
            end.add(vector);

            // Add sprite
            const sprite = createSpriteWithText(`${tick}`, tickFontSize, style.textColor);
            if (sprite !== undefined) {
              moveSpriteByPositionAndDirection(sprite, end, tickDirection);
              this.addChild(sprite);
              this.setUserDataOnAxis(sprite, wallIndex1, wallIndex2, true);
            }
          }
        }
        if (style.showAxisTicks) {
          const lineSegments = createLineSegments(vertices, style.axisColor, 1);
          this.setUserDataOnAxis(lineSegments, wallIndex1, wallIndex2, true);
          this.addChild(lineSegments);
        }
      }
      // Add axis sprite
      if (style.showAxisLabel) {
        const labelFontSize = style.axisLabelFontSize * tickLength;

        // Find the position by collision detect
        let position: Vector3;
        if (labelCount >= 2) {
          let tick = minLabelTick + Math.round(0.5 * labelCount - 0.5) * labelInc;
          if (labelInc === increment) {
            tick -= increment / 2;
          } else {
            tick -= increment;
          }
          position = this._corners[i0].clone();
          position.setComponent(dimension, tick);
        } else {
          position = getCenter(this._corners[i0], this._corners[i1]);
        }
        position = position.addScaledVector(tickDirection, tickLength * 5);

        // Align the text
        const sprite = createSpriteWithText(
          style.getAxisLabel(dimension),
          labelFontSize,
          style.textColor
        );
        if (sprite !== undefined) {
          moveSpriteByPositionAndDirection(sprite, position, tickDirection);
          this.addChild(sprite);
          this.setUserDataOnAxis(sprite, wallIndex1, wallIndex2, true);
        }
      }
    }
  }

  // ==================================================
  // INSTANCE METHODS: Add wall
  // ==================================================

  private addWall(style: AxisRenderStyle, usedWall: boolean[], wallIndex: number): void {
    if (!usedWall[wallIndex]) {
      return;
    }
    const indexes = Range3.getWallCornerIndexes(wallIndex);

    const buffer = new TrianglesBuffers(4);
    buffer.addPosition(this._corners[indexes[0]]);
    buffer.addPosition(this._corners[indexes[1]]);
    buffer.addPosition(this._corners[indexes[2]]);
    buffer.addPosition(this._corners[indexes[3]]);
    buffer.addTriangle(0, 1, 2);
    buffer.addTriangle(0, 2, 3);

    const squareMaterial = new MeshBasicMaterial({
      color: style.wallColor,
      side: BackSide,
      polygonOffset: true,
      polygonOffsetFactor: 1.0,
      polygonOffsetUnits: 4.0
    });
    const mesh = new Mesh(buffer.createBufferGeometry(), squareMaterial);
    this.setUserDataOnWall(mesh, wallIndex);
    this.addChild(mesh);
  }

  // ==================================================
  // INSTANCE METHODS: Add grid
  // ==================================================

  private addGrid(
    style: AxisRenderStyle,
    usedWall: boolean[],
    wallIndex: number,
    increment: number,
    dim1: number,
    dim2: number
  ): void {
    if (!usedWall[wallIndex]) {
      return;
    }
    const indexes = Range3.getWallCornerIndexes(wallIndex);
    const vertices: number[] = [];

    this.addGridInOneDirection(vertices, increment, indexes[0], indexes[1], indexes[3], dim1);
    this.addGridInOneDirection(vertices, increment, indexes[0], indexes[3], indexes[1], dim2);

    const lineSegments = createLineSegments(vertices, style.gridColor, 1);
    this.setUserDataOnWall(lineSegments, wallIndex);
    this.addChild(lineSegments);
  }

  private addGridInOneDirection(
    vertices: number[],
    increment: number,
    i0: number,
    i1: number,
    i2: number,
    dimension: number
  ): void {
    //   p2
    //     +-----------+
    //     | | | | | | |
    //     | | | | | | | <--- Draw these lines
    //     | | | | | | |
    //     +-----------+
    //   p0            p1

    const p0 = this._corners[i0].clone();
    const p1 = this._corners[i1].clone();
    const p2 = this._corners[i2].clone();

    const range = new Range1(p0.getComponent(dimension), p1.getComponent(dimension));
    if (range.isEmpty) {
      return;
    }
    const boldIncrement = range.getBoldIncrement(increment);
    for (const anyTick of range.getTicks(increment)) {
      const tick = Number(anyTick);
      if (!isIncrement(tick, boldIncrement)) {
        continue;
      }
      p0.setComponent(dimension, tick);
      p2.setComponent(dimension, tick);
      vertices.push(...p0);
      vertices.push(...p2);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Visibility
  // ==================================================

  private setUserDataOnWall(object: Object3D, setUserDataOnWall: number): void {
    object.userData[WALL_INDEX_NAME1] = setUserDataOnWall;
  }

  private setUserDataOnAxis(
    object: Object3D,
    wallIndex1: number,
    wallIndex2: number,
    mainAxis: boolean
  ): void {
    object.userData[WALL_INDEX_NAME1] = wallIndex1;
    object.userData[WALL_INDEX_NAME2] = wallIndex2;
    object.userData[MAIN_AXIS_NAME] = mainAxis;
  }

  private updateVisibleAxis(
    object: Object3D,
    cameraPosition: Vector3 | undefined,
    cameraDirection: Vector3 | undefined
  ): void {
    const wallIndex1 = object.userData[WALL_INDEX_NAME1] as number;
    if (wallIndex1 === undefined) {
      return;
    }
    const visible1 = this.isWallVisible(wallIndex1, cameraPosition, cameraDirection);
    const wallIndex2 = object.userData[WALL_INDEX_NAME2] as number;
    if (wallIndex2 === undefined) {
      object.visible = visible1;
      return;
    }
    const visible2 = this.isWallVisible(wallIndex2, cameraPosition, cameraDirection);
    const mainAxis = object.userData[MAIN_AXIS_NAME] as boolean;
    if (mainAxis) {
      object.visible = visible1 !== visible2;
    } else {
      object.visible = visible1 && visible2;
    }
  }

  private isWallVisible(
    wallIndex: number,
    cameraPosition: Vector3 | undefined,
    cameraDirection: Vector3 | undefined
  ): boolean {
    if (cameraDirection === undefined) {
      if (cameraPosition === undefined) {
        return false;
      }
      cameraDirection = new Vector3().subVectors(this._faceCenters[wallIndex], cameraPosition);
    }
    const normal = Range3.getWallNormal(wallIndex);
    return cameraDirection.dot(normal) > 0.02;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Getters
// ==================================================

function getGridInc(range: Range3, numTicks: number): number {
  let increment = 0;
  if (range.x.hasSpan) increment = Math.max(increment, range.x.getBestIncrement(numTicks));
  if (range.y.hasSpan) increment = Math.max(increment, range.y.getBestIncrement(numTicks));
  if (range.z.hasSpan) increment = Math.max(increment, range.z.getBestIncrement(numTicks));
  return increment;
}

// ==================================================
// PRIVATE FUNCTIONS: Visibility
// ==================================================

function getUseWall(range: Range3): boolean[] {
  const usedWall: boolean[] = new Array<boolean>(6);
  usedWall[0] = range.y.hasSpan && range.z.hasSpan;
  usedWall[1] = range.x.hasSpan && range.z.hasSpan;
  usedWall[2] = range.x.hasSpan && range.y.hasSpan;
  usedWall[3] = range.y.hasSpan && range.z.hasSpan;
  usedWall[4] = range.x.hasSpan && range.z.hasSpan;
  usedWall[5] = range.x.hasSpan && range.y.hasSpan;
  return usedWall;
}

// ==================================================
// PRIVATE FUNCTIONS: Creators
// ==================================================

function createLineSegments(vertices: number[], color: Color, linewidth: number): LineSegments {
  const material = new LineBasicMaterial({ color, linewidth });
  return new LineSegments(createBufferGeometry(vertices), material);

  function createBufferGeometry(vertices: number[]): BufferGeometry {
    const verticesArray = new Float32Array(vertices);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
    return geometry;
  }
}
