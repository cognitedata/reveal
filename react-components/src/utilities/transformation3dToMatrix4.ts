/*!
 * Copyright 2024 Cognite AS
 */

import { Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three';
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
  const quaternion = new Quaternion().setFromEuler(
    new Euler(
      MathUtils.degToRad(eulerRotationX),
      MathUtils.degToRad(eulerRotationY),
      MathUtils.degToRad(eulerRotationZ),
      'XYZ'
    )
  );

  return new Matrix4().compose(
    new Vector3(translationX, translationY, translationZ),
    quaternion,
    new Vector3(scaleX, scaleY, scaleZ)
  );
};
