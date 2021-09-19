/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { distanceBetweenLines } from './distanceBetweenLines';

export function distanceFromBoxToLine(box: THREE.Box3, line: THREE.Line3): number {
  const edge = new THREE.Line3();
  const boxIntersection = new THREE.Vector3();

  // ThreeJS doesn't support line segment <> box intersection, so
  // use ray intersection and check if point is on line segment
  const ray = new THREE.Ray(line.start, line.delta(new THREE.Vector3()));
  if (ray.intersectBox(box, boxIntersection)) {
    const { start, end } = line;
    if (start.distanceTo(boxIntersection) + end.distanceTo(boxIntersection) - start.distanceTo(end) < 1e-4) {
      return 0.0;
    }
  }

  //     x---x
  //    /   /|
  //  x---x  x
  //  |   | /
  //  x---x
  let minDistance = Infinity;

  // Front
  getEdge(box, [false, false, false], [true, false, false], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));
  getEdge(box, [true, false, false], [true, true, false], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));
  getEdge(box, [true, true, false], [false, true, false], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));
  getEdge(box, [false, true, false], [false, false, false], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));

  // Back
  getEdge(box, [false, false, true], [true, false, true], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));
  getEdge(box, [true, false, true], [true, true, true], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));
  getEdge(box, [true, true, true], [false, true, true], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));
  getEdge(box, [false, true, true], [false, false, true], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));

  // Left
  getEdge(box, [false, false, false], [false, false, true], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));
  getEdge(box, [false, true, false], [false, true, true], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));

  // Right
  getEdge(box, [true, false, false], [true, false, true], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));
  getEdge(box, [true, true, false], [true, true, true], edge);
  minDistance = Math.min(minDistance, distanceBetweenLines(line, edge));

  return minDistance;
}

const from = new THREE.Vector3();
const to = new THREE.Vector3();

function getEdge(
  box: THREE.Box3,
  fromPattern: [boolean, boolean, boolean],
  toPattern: [boolean, boolean, boolean],
  line: THREE.Line3
) {
  from.x = fromPattern[0] ? box.min.x : box.max.x;
  from.y = fromPattern[1] ? box.min.y : box.max.y;
  from.z = fromPattern[2] ? box.min.z : box.max.z;
  to.x = toPattern[0] ? box.min.x : box.max.x;
  to.y = toPattern[1] ? box.min.y : box.max.y;
  to.z = toPattern[2] ? box.min.z : box.max.z;
  line.set(from, to);
}
