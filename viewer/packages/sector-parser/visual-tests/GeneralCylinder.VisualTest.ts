/*!
 * Copyright 2022 Cognite AS
 */
import { Vector3, Vector4 } from 'three';
import type { GeneralCylinder } from '../../../test-utilities/src/primitives';
import { PrimitiveName } from '../../../test-utilities/src/primitives';
import { PrimitivesVisualTestFixture } from './PrimitivesVisualTestFixture';

type GeneralCylinderAttributes = {
  treeIndex: number;
  color: Vector4;
  centerA: Vector3;
  centerB: Vector3;
  radius: number;
  planeA: Vector4;
  planeB: Vector4;
  localXAxis: Vector3;
  angle: number;
  arcAngle: number;
};

export default class GeneralCylinderVisualTest extends PrimitivesVisualTestFixture {
  constructor() {
    const testCylinders: GeneralCylinderAttributes[] = [
      {
        treeIndex: 0,
        color: new Vector4(1, 0, 0, 1),
        centerA: new Vector3(0, 0.5, 1),
        centerB: new Vector3(0, 0, 0.5),
        radius: 0.2,
        planeA: new Vector4(0.4161, 0.0733, 0.9063, 2),
        planeB: new Vector4(0, 0, -1, 0),
        localXAxis: new Vector3(1, 0, 0),
        angle: 0,
        arcAngle: Math.PI * 2
      },
      {
        treeIndex: 1,
        color: new Vector4(255, 0, 0, 1),
        centerA: new Vector3(0, 0.5, 1),
        centerB: new Vector3(0, 0, 0.5),
        radius: 0.6,
        planeA: new Vector4(0.4161, 0.0733, 0.9063, 2),
        planeB: new Vector4(0, 0, -1, 0),
        localXAxis: new Vector3(1, 0, 0),
        angle: 0,
        arcAngle: Math.PI * 1.5
      },
      {
        treeIndex: 2,
        color: new Vector4(255, 0, 0, 1),
        centerA: new Vector3(2, 0, -1),
        centerB: new Vector3(-2, 0, -1),
        radius: 0.5,
        planeA: new Vector4(0.577, 0.577, 0.577, 2),
        planeB: new Vector4(0.577, 0.577, -0.577, 0),
        localXAxis: new Vector3(0, 1, 0),
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
