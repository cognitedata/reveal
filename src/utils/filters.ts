import {
  ANNOTATION_METADATA_PREFIX as PREFIX,
  getIdFilter,
  getExternalIdFilter,
} from '@cognite/annotations';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import { ResourceType, ResourceFilterProps } from 'types';
import {
  FileFilterProps,
  AssetFilterProps,
  EventFilter,
  Metadata,
  IdEither,
  DateRange,
} from '@cognite/sdk';

export const annotationInteralIdFilter = (
  fileId: number,
  resourceType?: ResourceType
) => {
  const filter = getIdFilter(fileId);
  if (resourceType) {
    filter.metadata[`${PREFIX}resource_type`] = resourceType;
  }
  return filter;
};

export const annotationExternalIdFilter = (
  id: string,
  resourceType?: ResourceType
) => {
  const filter = getExternalIdFilter(id);
  if (resourceType) {
    filter.metadata[`${PREFIX}resource_type`] = resourceType;
  }
  return filter;
};

export type FiltersWithResourceType = Required<ResourceFilterProps> & {
  resourceType: ResourceType;
};

export type FilterType =
  | AssetFilterProps
  | EventFilter
  | FileFilterProps
  | {
      name?: string | undefined;
      externalIdPrefix?: string | undefined;
      metadata?: Metadata | undefined;
      assetIds?: number[] | undefined;
      rootAssetIds?: number[] | undefined;
      dataSetIds?: IdEither[] | undefined;
      assetSubtreeIds?: IdEither[] | undefined;
      createdTime?: DateRange | undefined;
      lastUpdatedTime?: DateRange | undefined;
    }
  | undefined;

/**
 * Computes number of filters applied for a given resource type.
 * @param filter the type of the filter based on selected resource.
 * @returns Number of filters applied to that resource type.
 */
export const countByFilter = (filter: Partial<FilterType>) => {
  const count = filter
    ? Object.values(filter).filter(f => isBoolean(f) || (!!f && !isEmpty(f)))
        .length
    : 0;
  return count;
};

export const getSelectedFilter = ({
  resourceType,
  assetFilter,
  timeseriesFilter,
  sequenceFilter,
  eventFilter,
  fileFilter,
}: FiltersWithResourceType): FilterType => {
  switch (resourceType) {
    case 'asset': {
      return assetFilter;
    }
    case 'event': {
      return eventFilter;
    }
    case 'timeSeries': {
      return timeseriesFilter;
    }
    case 'file': {
      return fileFilter;
    }
    case 'sequence': {
      return sequenceFilter;
    }
    default: {
      return undefined;
    }
  }
};
