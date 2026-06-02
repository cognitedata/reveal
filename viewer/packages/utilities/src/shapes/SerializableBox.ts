/*!
 * Copyright 2022 Cognite AS
 */

import type { ISerializableShape } from './ISerializableShape';
import type { Mat4 } from '../linalg';

export type SerializableBox = ISerializableShape & {
  readonly invMatrix: Mat4;
};
