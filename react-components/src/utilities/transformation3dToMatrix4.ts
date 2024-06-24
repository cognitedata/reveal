/*!
 * Copyright 2024 Cognite AS
 */

import { Euler, MathUtils, Matrix4 } from 'three';
import { type Transformation3d } from '../hooks/types';

export const transformation3dToMatrix4 = ({
  translationX,
  translationY,
  translationZ,
  eulerRotationX,
  eulerRotationY,
  eulerRotationZ,
  scaleX,
  scaleY,
  scaleZ
}: Transformation3d): Matrix4 => {
  return new Matrix4()
    .makeTranslation(translationX, translationY, translationZ)
    .makeRotationFromEuler(
      new Euler(
        MathUtils.degToRad(eulerRotationX),
        MathUtils.degToRad(eulerRotationY),
        MathUtils.degToRad(eulerRotationZ),
        'XYZ'
      )
    )
    .makeScale(scaleX, scaleY, scaleZ);
};
