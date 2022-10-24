/*!
 * Copyright 2022 Cognite AS
 */

import { ISerializableShape } from './ISerializableShape';
import { Vec3 } from '../linalg';

export type SerializableCylinder = ISerializableShape & {
  centerA: Vec3;
  centerB: Vec3;
  radius: number;
};
