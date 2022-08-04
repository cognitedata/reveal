/*!
 * Copyright 2022 Cognite AS
 */



import { Vec3WithIndex } from '../styling/shapes/linalg';
import { MAX_POINTS_PER_NODE, MIN_POINT_OCTREE_NODE_SIZE } from './constants';
import * as THREE from 'three';

function createChildBoxes(box: THREE.Box3) {
  const middle = box.min.clone().add(box.max).multiplyScalar(0.5);

  const res = new Array<THREE.Box3>(8);

  for (let i = 0; i < 8; i++) {
    const newBox = new THREE.Box3();

    newBox.min.x = (i & 1) === 0 ? box.min.x : middle.x;
    newBox.min.y = (i & 2) === 0 ? box.min.y : middle.y;
    newBox.min.z = (i & 4) === 0 ? box.min.z : middle.z;

    newBox.max.x = (i & 1) === 0 ? middle.x : box.max.x;
    newBox.max.y = (i & 2) === 0 ? middle.y : box.max.y;
    newBox.max.z = (i & 4) === 0 ? middle.z : box.max.z;

    res[i] = newBox;
  }

  return res;
}

function getChildIndex(point: Vec3WithIndex, middle: THREE.Vector3) {
  return (point[0] < middle.x ? 0 : 1) +
    (point[1] < middle.y ? 0 : 2) +
    (point[2] < middle.z ? 0 : 4);
}


export class OctreeNode {

  // Either _children is undefined, or _points is
  private _children: Array<OctreeNode> | undefined;
  private _points: Array<Vec3WithIndex> | undefined;

  private _boundingBox: THREE.Box3;

  constructor(points: Vec3WithIndex[], box: THREE.Box3) {
    this._boundingBox = box;

    if (points.length > MAX_POINTS_PER_NODE && box.max.x - box.min.x >= MIN_POINT_OCTREE_NODE_SIZE) {
      this.split(points);
    } else {
      this._points = points;
    }
  }

  private split(points: Vec3WithIndex[]): void {
    this._children = new Array<OctreeNode>(8);

    const childPoints = new Array<Array<Vec3WithIndex>>(8);

    for (let i = 0; i < 8; i++) {
      childPoints[i] = new Array<Vec3WithIndex>();
    }

    const middle = this._boundingBox.min.clone().add(this._boundingBox.max).multiplyScalar(0.5);

    for (const point of points) {
      const ind = getChildIndex(point, middle);
      childPoints[ind].push(point);
    }

    const childBoxes = createChildBoxes(this._boundingBox);

    for (let i = 0; i < 8; i++) {
      this._children[i] = new OctreeNode(childPoints[i], childBoxes[i]);
    }
  }

  get children(): Array<OctreeNode> | undefined {
    return this._children;
  }

  get points(): Vec3WithIndex[] | undefined {
    return this._points;
  }

  get boundingBox(): THREE.Box3 {
    return this._boundingBox;
  }

  getPointsInBox(box: THREE.Box3, resList: Vec3WithIndex[]): void {
    if (this._children) {
      for (const child of this._children) {
        if (child.boundingBox.intersectsBox(box)) {
          child.getPointsInBox(box, resList);
        }
      }
    } else if (this._points) {
      const helpVec = new THREE.Vector3();

      for (const point of this._points) {
        helpVec.fromArray(point);
        if (box.containsPoint(helpVec)) {
          resList.push(point);
        }
      }
    }
  }
}
