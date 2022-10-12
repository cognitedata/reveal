/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { GeneralCylinder, PrimitiveName } from '../../../test-utilities/src/primitives';
import { PrimitivesVisualTestFixture } from './PrimitivesVisualTestFixture';

type GeneralCylinderAttributes = {
  treeIndex: number;
  color: THREE.Vector4;
  centerA: THREE.Vector3;
  centerB: THREE.Vector3;
  radius: number;
  planeA: THREE.Vector4;
  planeB: THREE.Vector4;
  localXAxis: THREE.Vector3;
  angle: number;
  arcAngle: number;
};

export default class GeneralCylinderVisualTest extends PrimitivesVisualTestFixture {
  constructor() {
    const testCylinders: GeneralCylinderAttributes[] = [
      {
        treeIndex: 0,
        color: new THREE.Vector4(1, 0, 0, 1),
        centerA: new THREE.Vector3(0, 0.5, 1),
        centerB: new THREE.Vector3(0, 0, 0.5),
        radius: 0.2,
        planeA: new THREE.Vector4(0.4161, 0.0733, 0.9063, 2),
        planeB: new THREE.Vector4(0, 0, -1, 0),
        localXAxis: new THREE.Vector3(1, 0, 0),
        angle: 0,
        arcAngle: Math.PI * 2
      },
      {
        treeIndex: 1,
        color: new THREE.Vector4(255, 0, 0, 1),
        centerA: new THREE.Vector3(0, 0.5, 1),
        centerB: new THREE.Vector3(0, 0, 0.5),
        radius: 0.6,
        planeA: new THREE.Vector4(0.4161, 0.0733, 0.9063, 2),
        planeB: new THREE.Vector4(0, 0, -1, 0),
        localXAxis: new THREE.Vector3(1, 0, 0),
        angle: 0,
        arcAngle: Math.PI * 1.5
      },
      {
        treeIndex: 2,
        color: new THREE.Vector4(255, 0, 0, 1),
        centerA: new THREE.Vector3(2, 0, -1),
        centerB: new THREE.Vector3(-2, 0, -1),
        radius: 0.5,
        planeA: new THREE.Vector4(0.577, 0.577, 0.577, 2),
        planeB: new THREE.Vector4(0.577, 0.577, -0.577, 0),
        localXAxis: new THREE.Vector3(0, 1, 0),
        angle: Math.PI * 0.3,
        arcAngle: Math.PI * 1.7
      }
    ];

    super(PrimitiveName.GeneralCylinder, testCylinders.map(getCylinderFromAttributes));

    function getCylinderFromAttributes(attributes: GeneralCylinderAttributes): GeneralCylinder {
      const { treeIndex, color, centerA, centerB, planeA, planeB, radius, angle, arcAngle, localXAxis } = attributes;
      return {
        treeIndex,
        color: color.toArray(),
        centerA: centerA.toArray(),
        centerB: centerB.toArray(),
        planeA: planeA.toArray(),
        planeB: planeB.toArray(),
        radius,
        angle,
        arcAngle,
        localXAxis: localXAxis.toArray()
      };
    }
  }
}
