/*!
 * Copyright 2024 Cognite AS
 */

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
  private readonly _sceneBoundingBox: Box3 = new Box3().makeEmpty(); // Cache the bounding box of the scene
  private readonly _expandedSceneBoundingBox: Range3 = new Range3();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): AxisRenderStyle {
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
    this.initializeCornersAndCenters(boundingBox);
    const useFace = createUseFaceArray(boundingBox);
    const { style } = this;

    // Add faces
    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
      this.addFace(style, useFace, faceIndex);
    }
    const increment = getBestIncrement(boundingBox, style.numberOfTicks);
    const tickLength = boundingBox.diagonal * style.tickLength;
    const props = { style, useFace, increment, tickLength };

    // Add X-axis
    if (boundingBox.x.hasSpan) {
      this.addAxis(props, 0, 1, 0, 1, 2);
      this.addAxis(props, 3, 2, 0, 2, 4);
      this.addAxis(props, 7, 6, 0, 4, 5);
      this.addAxis(props, 4, 5, 0, 1, 5);
    }
    // Add Y-axis
    if (boundingBox.y.hasSpan) {
      this.addAxis(props, 3, 0, 1, 0, 2);
      this.addAxis(props, 1, 2, 1, 2, 3);
      this.addAxis(props, 5, 6, 1, 3, 5);
      this.addAxis(props, 7, 4, 1, 0, 5);
    }
    // Add Z-axis
    if (boundingBox.z.hasSpan) {
      this.addAxis(props, 0, 4, 2, 0, 1);
      this.addAxis(props, 1, 5, 2, 1, 3);
      this.addAxis(props, 2, 6, 2, 3, 4);
      this.addAxis(props, 3, 7, 2, 0, 4);
    }
    // Add Grid
    if (style.showGrid) {
      this.addGrid(props, 0, 1, 2);
      this.addGrid(props, 1, 0, 2);
      this.addGrid(props, 2, 0, 1);
      this.addGrid(props, 3, 1, 2);
      this.addGrid(props, 4, 0, 2);
      this.addGrid(props, 5, 0, 1);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Add axis
  // ==================================================

  private addAxis(
    props: AxisProps,
    i0: number,
    i1: number,
    dimension: number,
    faceIndex1: number,
    faceIndex2: number
  ): void {
    const { style, useFace } = props;

    if (!useFace[faceIndex1] && !useFace[faceIndex2]) {
      return;
    }
    if (style.showAxis) {
      this.addAxisLine(style, i0, i1, dimension, faceIndex1, faceIndex2);
    }
    this.addAxisTickmarksAndLabels(props, i0, i1, dimension, faceIndex1, faceIndex2);
  }

  private addAxisLine(
    style: AxisRenderStyle,
    i0: number,
    i1: number,
    dimension: number,
    faceIndex1: number,
    faceIndex2: number
  ): void {
    // Draw axis
    for (let i = 0; i < 2; i++) {
      const isMainAxis = i === 0;

      const color = style.getAxisColor(isMainAxis, convertToViewerDimension(dimension));
      const linewidth = isMainAxis ? 2 : 1;
      const vertices: number[] = [];

      vertices.push(...this._corners[i0]);
      vertices.push(...this._corners[i1]);

      const lineSegments = createLineSegments(vertices, color, linewidth);
      this.setUserDataOnAxis(lineSegments, faceIndex1, faceIndex2, isMainAxis);
      this.addChild(lineSegments);
    }
  }

  private addAxisTickmarksAndLabels(
    props: AxisProps,
    i0: number,
    i1: number,
    dimension: number,
    faceIndex1: number,
    faceIndex2: number
  ): void {
    const range = new Range1(
      this._corners[i0].getComponent(dimension),
      this._corners[i1].getComponent(dimension)
    );
    if (range.isEmpty) {
      return;
    }
    let minLabelTick = 0;
    let labelCount = 0;
    const { style, tickLength, increment } = props;

    // Draw ticks
    const labelInc = range.getBoldIncrement(increment);
    const tickDirection = getTickDirection(faceIndex1, faceIndex2, new Vector3());
    tickDirection.normalize();

    // Add tick marks and labels
    if (style.showAxisTicks || style.showAxisNumbers) {
      const vertices: number[] = [];
      const tickFontSize = style.tickFontSize * tickLength;
      for (const tick of range.getTicks(increment)) {
        const start = newVector3(this._corners[i0]);
        start.setComponent(dimension, tick);
        const end = newVector3(start);

        // Add tick mark
        if (style.showAxisTicks) {
          end.addScaledVector(tickDirection, tickLength);
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
          end.addScaledVector(tickDirection, 2 * tickLength);
          const text = incrementToString(tick);
          const sprite = createSpriteWithText(text, tickFontSize, style.textColor);
          if (sprite === undefined) {
            continue;
          }
          sprite.position.copy(end);
          this.addChild(sprite);
          this.setUserDataOnAxis(sprite, faceIndex1, faceIndex2, true);
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
      let tick = minLabelTick + Math.round(0.5 * labelCount - 0.5) * labelInc;
      if (labelInc === increment) {
        tick -= increment / 2;
      } else {
        tick -= increment;
      }
      position.copy(this._corners[i0]);
      position.setComponent(dimension, tick);
      position.addScaledVector(tickDirection, tickLength * 5);

      const sprite = createSpriteWithText(
        style.getAxisLabel(convertToViewerDimension(dimension)),
        labelFontSize,
        style.textColor
      );
      if (sprite === undefined) {
        return;
      }
      moveSpriteByPositionAndDirection(sprite, position, tickDirection);
      this.addChild(sprite);
      this.setUserDataOnAxis(sprite, faceIndex1, faceIndex2, true);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Add face
  // ==================================================

  private addFace(style: AxisRenderStyle, useFace: boolean[], faceIndex: number): void {
    if (!useFace[faceIndex]) {
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

  private addGrid(props: AxisProps, faceIndex: number, dim1: number, dim2: number): void {
    const { style, useFace, increment } = props;
    if (!useFace[faceIndex]) {
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

  protected initializeCornersAndCenters(boundingBox: Range3): void {
    if (boundingBox.isEmpty) {
      return;
    }
    // Initialize the corners and the centers
    boundingBox.getCornerPoints(this._corners);
    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
      const indexes = getFaceCornerIndexes(faceIndex);
      const center = this._faceCenters[faceIndex];
      center.copy(this._corners[indexes[0]]);
      center.add(this._corners[indexes[1]]);
      center.add(this._corners[indexes[2]]);
      center.add(this._corners[indexes[3]]);
      center.divideScalar(4);
    }
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

function convertToViewerDimension(dimension: number): number {
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
// PRIVATE FUNCTIONS: Creators
// ==================================================

function createUseFaceArray(range: Range3): boolean[] {
  const useFace: boolean[] = new Array<boolean>(6);
  useFace[0] = range.y.hasSpan && range.z.hasSpan;
  useFace[1] = range.x.hasSpan && range.z.hasSpan;
  useFace[2] = range.x.hasSpan && range.y.hasSpan;
  useFace[3] = range.y.hasSpan && range.z.hasSpan;
  useFace[4] = range.x.hasSpan && range.z.hasSpan;
  useFace[5] = range.x.hasSpan && range.y.hasSpan;
  return useFace;
}

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
// PRIVATE METHODS: Some math
// ==================================================

// Corner and faces is pr. definition:
//            5  4
//            v /
//        7--------6                7-------6
//       / |      /|               / |      /|
//      4-------5  |              4-------5  |
// 0->  |  |    |  |  <-3         |  |    |  |
//      |  3----|--2              |  3----|--2
//      | /     | /               | /     | /
//      0-------1                 0-------1
//        /  ^
//       1   2
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

function incrementToString(value: number): string {
  // Sometimes the number comes out like this: 1.20000005 or 1.19999992 due to numeric precision limitations.
  // To get better rounded values, I wrote this myself: Multiply by some high integer and round it, then
  // convert to text, and insert the comma manually afterwards.

  // Small number get less accurate result in tjhis algorithm,, so use the default string conversion.
  if (Math.abs(value) < 0.001) {
    return `${value}`;
  }
  const sign = Math.sign(value);
  const rounded = Math.abs(Math.round(value * 1e5));
  let text = `${rounded}`;
  if (text.length === 1) {
    text = `${'0.0000'}${text}`;
  } else if (text.length === 2) {
    text = `${'0.000'}${text}`;
  } else if (text.length === 3) {
    text = `${'0.00'}${text}`;
  } else if (text.length === 4) {
    text = `${'0.0'}${text}`;
  } else if (text.length === 5) {
    text = `${'0.'}${text}`;
  } else if (text.length >= 6) {
    const i = text.length - 5;
    text = `${text.slice(0, i)}${'.'}${text.slice(i)}`;
  }
  // Since we know that the comma are there,
  // we can safely remove trailing zeros
  while (text[text.length - 1] === '0') {
    text = text.slice(0, -1);
  }
  // Remove if last is a comma
  if (text[text.length - 1] === '.') {
    text = text.slice(0, -1);
  }
  // Put the negative sign in the front
  if (sign < 0) {
    text = `${'-'}${text}`;
  }
  return text;
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}

// ==================================================
// HELPER TYPE
// ==================================================

type AxisProps = {
  style: AxisRenderStyle;
  useFace: boolean[];
  increment: number;
  tickLength: number;
};
