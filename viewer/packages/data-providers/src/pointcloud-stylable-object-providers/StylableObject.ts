/*!
 * Copyright 2022 Cognite AS
 */

import { ISerializableShape, IShape } from '@reveal/utilities';

export type StylableObject = {
  objectId: number;
  shape: IShape;
};

export type SerializableStylableObject = {
  objectId: number;
  shape: ISerializableShape;
};
