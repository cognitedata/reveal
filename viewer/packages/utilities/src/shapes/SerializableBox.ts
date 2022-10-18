/*!
 * Copyright 2022 Cognite AS
 */

import { ISerializableShape } from './ISerializableShape';
import { Mat4 } from '../linalg';

export type SerializableBox = ISerializableShape & {
  readonly invMatrix: Mat4;
};
