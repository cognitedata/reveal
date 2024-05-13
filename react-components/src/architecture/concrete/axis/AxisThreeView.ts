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
import { isIncrement } from '../../base/utilities/extensions/mathExtensions';
import { Range1 } from '../../base/utilities/geometry/Range1';
import { type AxisRenderStyle } from './AxisRenderStyle';
import {
  createSpriteWithText,
  moveSpriteByPositionAndDirection
} from '../../base/utilities/sprites/createSprite';
import { TrianglesBuffers } from '../../base/utilities/geometry/TrianglesBuffers';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { Vector3Pool } from '../../base/utilities/geometry/Vector3Pool';

const FACE_INDEX_NAME1 = 'faceIndex1';
const FACE_INDEX_NAME2 = 'faceIndex2';
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
      cameraDirection = camera.getWorldDirection(newVector3());
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
    if (sceneBoundingBox.equals(this._sceneBoundingBox)) {
      return false;
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
    const useFace = getUseFace(boundingBox);
    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
      const indexes = getFaceCornerIndexes(faceIndex);
      const center = this._faceCenters[faceIndex];
      center.copy(this._corners[indexes[0]]);
      center.add(this._corners[indexes[1]]);
      center.add(this._corners[indexes[2]]);
      center.add(this._corners[indexes[3]]);
      center.divideScalar(4);
    }
    // Add Faces
    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
      this.addFace(style, useFace, faceIndex);
    }
    const increment = getBestIncrement(boundingBox, style.numberOfTicks);
    if (boundingBox.x.hasSpan) {
      this.addAxis(style, useFace, increment, tickLength, 0, 1, 0, 1, 2);
      this.addAxis(style, useFace, increment, tickLength, 3, 2, 0, 2, 4);
      this.addAxis(style, useFace, increment, tickLength, 7, 6, 0, 4, 5);
      this.addAxis(style, useFace, increment, tickLength, 4, 5, 0, 1, 5);
    }
    // Add Y axis
    if (boundingBox.y.hasSpan) {
      this.addAxis(style, useFace, increment, tickLength, 3, 0, 1, 0, 2);
      this.addAxis(style, useFace, increment, tickLength, 1, 2, 1, 2, 3);
      this.addAxis(style, useFace, increment, tickLength, 5, 6, 1, 3, 5);
      this.addAxis(style, useFace, increment, tickLength, 7, 4, 1, 0, 5);
    }
    // Add Z axis
    if (boundingBox.z.hasSpan) {
      this.addAxis(style, useFace, increment, tickLength, 0, 4, 2, 0, 1);
      this.addAxis(style, useFace, increment, tickLength, 1, 5, 2, 1, 3);
      this.addAxis(style, useFace, increment, tickLength, 2, 6, 2, 3, 4);
      this.addAxis(style, useFace, increment, tickLength, 3, 7, 2, 0, 4);
    }

    // Add Grid
    if (style.showGrid) {
      this.addGrid(style, useFace, 0, increment, 1, 2);
      this.addGrid(style, useFace, 1, increment, 0, 2);
      this.addGrid(style, useFace, 2, increment, 0, 1);
      this.addGrid(style, useFace, 3, increment, 1, 2);
      this.addGrid(style, useFace, 4, increment, 0, 2);
      this.addGrid(style, useFace, 5, increment, 0, 1);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Add axis
  // ==================================================

  private addAxis(
    style: AxisRenderStyle,
    usedFace: boolean[],
    increment: number,
    tickLength: number,
    i0: number,
    i1: number,
    dimension: number,
    faceIndex1: number,
    faceIndex2: number
  ): void {
    if (!usedFace[faceIndex1] && !usedFace[faceIndex2]) {
      return;
    }
    // Draw axis
    if (style.showAxis) {
      for (let i = 0; i < 2; i++) {
        const isMainAxis = i === 0;

        const color = style.getAxisColor(isMainAxis, rotateToViewer(dimension));
        const linewidth = isMainAxis ? 2 : 1;
        const vertices: number[] = [];

        vertices.push(...this._corners[i0]);
        vertices.push(...this._corners[i1]);

        const lineSegments = createLineSegments(vertices, color, linewidth);
        this.setUserDataOnAxis(lineSegments, faceIndex1, faceIndex2, isMainAxis);
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
      const tickDirection = getTickDirection(faceIndex1, faceIndex2, newVector3());

      // Add tick marks and labels
      if (style.showAxisTicks || style.showAxisNumbers) {
        const vertices: number[] = [];
        const tickFontSize = style.tickFontSize * tickLength;
        for (const tick of range.getTicks(increment)) {
          const start = newVector3(this._corners[i0]);
          start.setComponent(dimension, tick);

          const end = newVector3(start);
          const vector = newVector3(tickDirection);
          vector.multiplyScalar(tickLength);

          // Add tick mark
          if (style.showAxisTicks) {
            end.add(vector);
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
              this.setUserDataOnAxis(sprite, faceIndex1, faceIndex2, true);
            }
          }
        }
        if (style.showAxisTicks) {
          const lineSegments = createLineSegments(vertices, style.mainAxisColor, 1);
          this.setUserDataOnAxis(lineSegments, faceIndex1, faceIndex2, true);
          this.addChild(lineSegments);
        }
      }
      // Add axis sprite
      if (style.showAxisLabel) {
        const labelFontSize = style.axisLabelFontSize * tickLength;

        // Find the best position by collision detect
        const position = newVector3();
        if (labelCount >= 2) {
          let tick = minLabelTick + Math.round(0.5 * labelCount - 0.5) * labelInc;
          if (labelInc === increment) {
            tick -= increment / 2;
          } else {
            tick -= increment;
          }
          position.copy(this._corners[i0]);
          position.setComponent(dimension, tick);
        } else {
          position.copy(this._corners[i0]);
          position.add(this._corners[i1]);
        }
        position.addScaledVector(tickDirection, tickLength * 5);

        const sprite = createSpriteWithText(
          style.getAxisLabel(rotateToViewer(dimension)),
          labelFontSize,
          style.textColor
        );
        if (sprite !== undefined) {
          moveSpriteByPositionAndDirection(sprite, position, tickDirection);
          this.addChild(sprite);
          this.setUserDataOnAxis(sprite, faceIndex1, faceIndex2, true);
        }
      }
    }
  }

  // ==================================================
  // INSTANCE METHODS: Add face
  // ==================================================

  private addFace(style: AxisRenderStyle, usedFace: boolean[], faceIndex: number): void {
    if (!usedFace[faceIndex]) {
      return;
    }
    const indexes = getFaceCornerIndexes(faceIndex);

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
    this.setUserDataOnFace(mesh, faceIndex);
    this.addChild(mesh);
  }

  // ==================================================
  // INSTANCE METHODS: Add grid
  // ==================================================

  private addGrid(
    style: AxisRenderStyle,
    usedFace: boolean[],
    faceIndex: number,
    increment: number,
    dim1: number,
    dim2: number
  ): void {
    if (!usedFace[faceIndex]) {
      return;
    }
    const indexes = getFaceCornerIndexes(faceIndex);
    const vertices: number[] = [];

    this.addGridInOneDirection(vertices, increment, indexes[0], indexes[1], indexes[3], dim1);
    this.addGridInOneDirection(vertices, increment, indexes[0], indexes[3], indexes[1], dim2);

    const lineSegments = createLineSegments(vertices, style.gridColor, 1);
    this.setUserDataOnFace(lineSegments, faceIndex);
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

    const p0 = newVector3(this._corners[i0]);
    const p1 = this._corners[i1];
    const p2 = newVector3(this._corners[i2]);

    const range = new Range1(p0.getComponent(dimension), p1.getComponent(dimension));
    if (range.isEmpty) {
      return;
    }
    const boldIncrement = range.getBoldIncrement(increment);
    for (const tick of range.getTicks(increment)) {
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

  private setUserDataOnFace(object: Object3D, setUserDataOnFace: number): void {
    object.userData[FACE_INDEX_NAME1] = setUserDataOnFace;
  }

  private setUserDataOnAxis(
    object: Object3D,
    faceIndex1: number,
    faceIndex2: number,
    mainAxis: boolean
  ): void {
    object.userData[FACE_INDEX_NAME1] = faceIndex1;
    object.userData[FACE_INDEX_NAME2] = faceIndex2;
    object.userData[MAIN_AXIS_NAME] = mainAxis;
  }

  private updateVisibleAxis(
    object: Object3D,
    cameraPosition: Vector3 | undefined,
    cameraDirection: Vector3 | undefined
  ): void {
    const faceIndex1 = object.userData[FACE_INDEX_NAME1] as number;
    if (faceIndex1 === undefined) {
      return;
    }
    const visible1 = this.isFaceVisible(faceIndex1, cameraPosition, cameraDirection);
    const faceIndex2 = object.userData[FACE_INDEX_NAME2] as number;
    if (faceIndex2 === undefined) {
      object.visible = visible1;
      return;
    }
    const visible2 = this.isFaceVisible(faceIndex2, cameraPosition, cameraDirection);
    const mainAxis = object.userData[MAIN_AXIS_NAME] as boolean;
    if (mainAxis) {
      object.visible = visible1 !== visible2;
    } else {
      object.visible = visible1 && visible2;
    }
  }

  private isFaceVisible(
    faceIndex: number,
    cameraPosition: Vector3 | undefined,
    cameraDirection: Vector3 | undefined
  ): boolean {
    if (cameraDirection === undefined) {
      if (cameraPosition === undefined) {
        return false;
      }
      cameraDirection = newVector3().subVectors(this._faceCenters[faceIndex], cameraPosition);
    }
    const normal = getFaceNormal(faceIndex, newVector3());
    return cameraDirection.dot(normal) > 0.02;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Getters
// ==================================================

function getBestIncrement(range: Range3, numberOfTicks: number): number {
  let increment = 0;
  if (range.x.hasSpan) increment = Math.max(increment, range.x.getBestIncrement(numberOfTicks));
  if (range.y.hasSpan) increment = Math.max(increment, range.y.getBestIncrement(numberOfTicks));
  if (range.z.hasSpan) increment = Math.max(increment, range.z.getBestIncrement(numberOfTicks));
  return increment;
}

function rotateToViewer(dimension: number): number {
  // This swaps the Z and Y axis
  if (dimension === 1) {
    return 2;
  }
  if (dimension === 2) {
    return 1;
  }
  return dimension;
}

// ==================================================
// PRIVATE FUNCTIONS: Visibility
// ==================================================

function getUseFace(range: Range3): boolean[] {
  const usedFace: boolean[] = new Array<boolean>(6);
  usedFace[0] = range.y.hasSpan && range.z.hasSpan;
  usedFace[1] = range.x.hasSpan && range.z.hasSpan;
  usedFace[2] = range.x.hasSpan && range.y.hasSpan;
  usedFace[3] = range.y.hasSpan && range.z.hasSpan;
  usedFace[4] = range.x.hasSpan && range.z.hasSpan;
  usedFace[5] = range.x.hasSpan && range.y.hasSpan;
  return usedFace;
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

// ==================================================
// PRIVATE METHODS: Some math for Range3
// ==================================================

// Corner and faces is pr. definition:
//            5      4
//            v     /
//        7--------6                7-------6
//       / |      /|               / |      /|
//      4-------5  |              4-------5  |
// 0->  |  |    |  |  <-3         |  |    |  |
//      |  3----|--2              |  3----|--2
//      | /     | /               | /     | /
//      0-------1                 0-------1
//    /     ^
//   1      2
// Face number are marked with arrows

function getFaceNormal(faceIndex: number, target: Vector3): Vector3 {
  switch (faceIndex) {
    case 0:
      return target.set(-1, +0, +0);
    case 1:
      return target.set(+0, -1, +0);
    case 2:
      return target.set(+0, +0, -1);
    case 3:
      return target.set(+1, +0, +0);
    case 4:
      return target.set(+0, +1, +0);
    case 5:
      return target.set(+0, +0, +1);
    default:
      throw Error('getFaceNormal');
  }
}

function getFaceCornerIndexes(faceIndex: number): number[] {
  // These as CCW
  switch (faceIndex) {
    case 0:
      return [3, 0, 4, 7];
    case 1:
      return [0, 1, 5, 4];
    case 2:
      return [3, 2, 1, 0];
    case 3:
      return [1, 2, 6, 5];
    case 4:
      return [2, 3, 7, 6];
    case 5:
      return [4, 5, 6, 7];
    default:
      Error('getFaceCornerIndexes');
      return [0, 0, 0, 0];
  }
}

function getTickDirection(faceIndex1: number, faceIndex2: number, target: Vector3): Vector3 {
  target.setScalar(0);

  if (faceIndex1 === 0 || faceIndex2 === 0) target.x = -Math.SQRT1_2;
  if (faceIndex1 === 3 || faceIndex2 === 3) target.x = Math.SQRT1_2;

  if (faceIndex1 === 1 || faceIndex2 === 1) target.y = -Math.SQRT1_2;
  if (faceIndex1 === 4 || faceIndex2 === 4) target.y = Math.SQRT1_2;

  if (faceIndex1 === 2 || faceIndex2 === 2) target.z = -Math.SQRT1_2;
  if (faceIndex1 === 5 || faceIndex2 === 5) target.z = Math.SQRT1_2;
  return target;
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
