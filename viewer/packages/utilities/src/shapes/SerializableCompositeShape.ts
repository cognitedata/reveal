/*!
 * Copyright 2022 Cognite AS
 */

import type { ISerializableShape } from './ISerializableShape';

export type SerializableCompositeShape = ISerializableShape & {
  readonly innerShapes: ISerializableShape[];
};
