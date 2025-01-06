/*!
 * Copyright 2023 Cognite AS
 */

import { Vector3 } from 'three';
import { Image360 } from './entity/Image360';
import { Image360Revision } from './entity/Image360Revision';
import { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers';
import { Image360Entity } from './entity/Image360Entity';
import { DefaultImage360Collection } from './collection/DefaultImage360Collection';

/**
 * The SourceType of a 360 image collection
 */
export type Image360CollectionSourceType = 'event' | 'dm' | 'cdm';

/**
 * Delegate for 360 image mode entered events.
 */
export type Image360EnteredDelegate<T extends DataSourceType = ClassicDataSourceType> = (
  image360: Image360<T>,
  revision: Image360Revision<T>
) => void;

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
