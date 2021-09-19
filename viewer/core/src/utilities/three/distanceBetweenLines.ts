/*!
 * Copyright 2021 Cognite AS
 */

// Ported from https://gist.github.com/cuberoot/b5047c83cf277fee1b82.

// Port of code from: http://geomalgorithms.com/a07-_distance.html
//
// Ported by Michael Taylor, Dec 8 2014
//
// Copyright 2001 softSurfer, 2012 Dan Sunday
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// SoftSurfer makes no warranty for this code, and cannot be held
// liable for any real or imagined damage resulting from its use.
// Users of this code must verify correctness for their application.

import * as THREE from 'three';

const EPSILON = 1e-5;

export function distanceBetweenLines(line1: THREE.Line3, line2: THREE.Line3): number {
  const { start: startPt1, end: endPt1 } = line1;
  const { start: startPt2, end: endPt2 } = line2;

  const u = new THREE.Vector3();
  u.subVectors(endPt1, startPt1);
  const v = new THREE.Vector3();
  v.subVectors(endPt2, startPt2);
  const w = new THREE.Vector3();
  w.subVectors(startPt1, startPt2);

  const a = u.dot(u); // always >= 0
  const b = u.dot(v);
  const c = v.dot(v); // always >= 0
  const d = u.dot(w);
  const e = v.dot(w);

  const D = a * c - b * b; // always >= 0
  let sD = D; // default sD = D >= 0
  let tD = D; // default tD = D >= 0

  // compute the line parameters of the two closest points
  let sN: number;
  let tN: number;
  if (D < EPSILON) {
    // the lines are almost parallel
    sN = 0.0; // force using point P0 on segment S1
    sD = 1.0; // to prevent possible division by 0.0 later
    tN = e;
    tD = c;
  } else {
    // get the closest points on the infinite lines
    sN = b * e - c * d;
    tN = a * e - b * d;
    if (sN < 0.0) {
      // sc < 0 => the s=0 edge is visible
      sN = 0.0;
      tN = e;
      tD = c;
    } else if (sN > sD) {
      // sc > 1  => the s=1 edge is visible
      sN = sD;
      tN = e + b;
      tD = c;
    }
  }

  if (tN < 0.0) {
    // tc < 0 => the t=0 edge is visible
    tN = 0.0;
    // recompute sc for this edge
    if (-d < 0.0) {
      sN = 0.0;
    } else if (-d > a) {
      sN = sD;
    } else {
      sN = -d;
      sD = a;
    }
  } else if (tN > tD) {
    // tc > 1  => the t=1 edge is visible
    tN = tD;
    // recompute sc for this edge
    if (-d + b < 0.0) {
      sN = 0;
    } else if (-d + b > a) {
      sN = sD;
    } else {
      sN = -d + b;
      sD = a;
    }
  }

  // finally do the division to get sc and tc
  const sc = Math.abs(sN) < EPSILON ? 0.0 : sN / sD;
  const tc = Math.abs(tN) < EPSILON ? 0.0 : tN / tD;

  // get the difference of the two closest points
  const sc_mult_u = new THREE.Vector3();
  sc_mult_u.copy(u);
  sc_mult_u.multiplyScalar(sc);
  const tc_mult_v = new THREE.Vector3();
  tc_mult_v.copy(v);
  tc_mult_v.multiplyScalar(tc);
  const dP = new THREE.Vector3();
  dP.copy(w);
  dP.add(sc_mult_u);
  dP.sub(tc_mult_v);

  return dP.length(); // return the closest distance
}
