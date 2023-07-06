import { ResourceType } from '@data-exploration-lib/core';

export type CountsResourceType = Exclude<ResourceType, 'threeD'>;
