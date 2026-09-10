/*!
 * Copyright 2022 Cognite AS
 */

import type { ISerializableShape } from './ISerializableShape';
import type { Vec3 } from '../linalg';

export type SerializableCylinder = ISerializableShape & {
  centerA: Vec3;
  centerB: Vec3;
  radius: number;
};
