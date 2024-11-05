/*!
 * Copyright 2023 Cognite AS
 */

import { Vector3 } from 'three';
import { Image360 } from './entity/Image360';
import { Image360Revision } from './entity/Image360Revision';
import { DataSourceType } from 'api-entry-points/core';
import { Image360Entity } from './entity/Image360Entity';
import { DefaultImage360Collection } from './collection/DefaultImage360Collection';

/**
 * Delegate for 360 image mode entered events.
 */
export type Image360EnteredDelegate = (image360: Image360, revision: Image360Revision) => void;

/**
 * Delegate for 360 image mode exited events.
 */
export type Image360ExitedDelegate = () => void;

export type Image360IconIntersectionData<T extends DataSourceType = DataSourceType> = {
  image360Collection: DefaultImage360Collection<T>;
  image360: Image360Entity<T>;
  point: Vector3;
  distanceToCamera: number;
};
