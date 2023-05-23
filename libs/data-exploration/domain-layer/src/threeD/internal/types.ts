import { Model3D, Revision3D } from '@cognite/sdk';
import { UseQueryOptions } from 'react-query';
import { ResourceType } from '@data-exploration-lib/core';
import { InternalEventsData } from '../../events';

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Model3DWithType = PartialBy<
  Model3D,
  'metadata' | 'dataSetId' | 'createdTime' | 'id'
> & {
  type: ResourceType | 'img360';
  siteId?: string;
};

export type RevisionOpts<T> = UseQueryOptions<
  Revision3DWithIndex[],
  unknown,
  T
>;

export type Revision3DWithIndex = Revision3D & { index: number };

export type InternalThreeDRevisionData = Revision3D;
export interface InternalThreeDModelData extends Model3DWithType {
  revisions?: InternalThreeDRevisionData[];
}

export type ThreeDModelsResponse = {
  items: Model3D[];
  nextCursor?: string;
};

export type InternalEventWithMetadata = Pick<
  InternalEventsData,
  Exclude<keyof InternalEventsData, 'metadata'>
> & { metadata?: { site_id: string; site_name: string } };
