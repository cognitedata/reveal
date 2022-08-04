/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from '../../styling/StylableObject';

import * as THREE from 'three';

import { StylableObjectBvhElement } from './StylableObjectBvhElement';
import { BoundingVolumeHierarchy } from '../../bvh/BoundingVolumeHierarchy';
import { PointOctree } from '../../pointOctree/PointOctree';
import { traverseBvhs } from './traverseBvhs';
// import { matchOctreeWithBvh, traverseOctree } from './matchPointOctreeWithBvh';

export function computeObjectIdBuffer(
  inputPositionBuffer: Float32Array,
  objectList: StylableObject[],
  pointOffset: THREE.Vector3,
  sectorBoundingBox: THREE.Box3
): ArrayBuffer {

  const numPoints = inputPositionBuffer.length / 3;
  console.time(`match ${numPoints} points to ${objectList.length} objects`);

  const rawObjectIdBuffer = new ArrayBuffer(2 * numPoints);
  const objectIdBufferView = new Uint16Array(rawObjectIdBuffer);
  console.log('Sector bounding box: ', sectorBoundingBox);

  const positionBuffer = new Float64Array(inputPositionBuffer.length);;

  for (let i = 0; i < numPoints; i++) {
    positionBuffer[i * 3 + 0] = inputPositionBuffer[i * 3 + 0] + pointOffset.x;
    positionBuffer[i * 3 + 1] = inputPositionBuffer[i * 3 + 1] + pointOffset.y;
    positionBuffer[i * 3 + 2] = inputPositionBuffer[i * 3 + 2] + pointOffset.z;
  }

  const helpVec = new THREE.Vector3();

  console.time(`-- constructing point octree for ${positionBuffer.length / 3} points`);
  const pointOctree = new PointOctree(positionBuffer, sectorBoundingBox, pointOffset);
  console.timeEnd(`-- constructing point octree for ${positionBuffer.length / 3} points`);

  let numAssignments = 0;
  let numPointsTraversed = 0;

  for (const stylableObject of objectList) {
    const points = pointOctree.getPointsInBox(stylableObject.shape.createBoundingBox());
    for (const point of points) {
      helpVec.fromArray(point);
      if (stylableObject.shape.containsPoint(helpVec)) {
        objectIdBufferView[point[3]] = stylableObject.objectId;
        numAssignments++;
      }
    }

    numPointsTraversed += points.length
  }

  console.log(`Num assignments / num points traversed ratio: ${numAssignments / numPointsTraversed}`);

  // const maxVector = new THREE.Vector3(- Infinity, - Infinity, - Infinity);

  /* console.time(`-- constructing BVH for ${objectList.length} objects`);
  const bvhElements = objectList.map(obj => new StylableObjectBvhElement(obj));
  const bvh = new BoundingVolumeHierarchy(bvhElements);
  console.timeEnd(`-- constructing BVH for ${objectList.length} objects`);

  for (let i = 0; i < numPoints; i++) {
    const position = helpVec.fromArray(positionBuffer, 3 * i);

    const elements = bvh.findContainingElements(position);

    for (const element of elements) {
      if (element.stylableObject.shape.containsPoint(position)) {
        // NB: We use the first object that is found to contain the point
        objectIdBufferView[i] = element.stylableObject.objectId;
        break;
      }
    }
  } */

  // console.log(`Num assignments per leaf hit: ${numAssignments / numLeafHits}`);

  // traverseBvhs(pointOctree, bvh, objectIdBufferView);

  console.timeEnd(`match ${positionBuffer.length / 3} points to ${objectList.length} objects`);

  return rawObjectIdBuffer;
}
