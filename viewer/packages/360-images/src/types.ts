/*!
 * Copyright 2023 Cognite AS
 */

import type { Vector3 } from 'three';
import type { Image360 } from './entity/Image360';
import type { Image360Revision } from './entity/Image360Revision';
import type { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers';
import type { Image360Entity } from './entity/Image360Entity';
import type { DefaultImage360Collection } from './collection/DefaultImage360Collection';

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

/**
 * Data for a cluster intersection result
 */
export type Image360ClusterIntersectionData<T extends DataSourceType = DataSourceType> = {
  image360Collection: DefaultImage360Collection<T>;
  clusterPosition: Vector3;
  clusterSize: number;
  clusterIcons: Image360Entity<T>[];
  distanceToCamera: number;
};
