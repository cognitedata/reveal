import { ResourceType, ResourceTypes } from '@data-exploration-lib/core';

import { BaseResourceProps } from '../types';

import { useTotalRelatedResourcesCount } from './useTotalRelatedResourcesCount';

export const useTotalRelatedResourcesCounts = ({
  resource,
  isDocumentsApiEnabled = true,
}: {
  resource: BaseResourceProps;
  isDocumentsApiEnabled?: boolean;
}) => {
  const assets = useTotalRelatedResourcesCount({
    resource,
    resourceType: ResourceTypes.Asset,
    isDocumentsApiEnabled,
  });

  const events = useTotalRelatedResourcesCount({
    resource,
    resourceType: ResourceTypes.Event,
    isDocumentsApiEnabled,
  });

  const timeseries = useTotalRelatedResourcesCount({
    resource,
    resourceType: ResourceTypes.TimeSeries,
    isDocumentsApiEnabled,
  });

  const sequences = useTotalRelatedResourcesCount({
    resource,
    resourceType: ResourceTypes.Sequence,
    isDocumentsApiEnabled,
  });

  const files = useTotalRelatedResourcesCount({
    resource,
    resourceType: ResourceTypes.File,
    isDocumentsApiEnabled,
  });

  const data: Record<ResourceType, number> = {
    [ResourceTypes.Asset]: assets.data,
    [ResourceTypes.Event]: events.data,
    [ResourceTypes.TimeSeries]: timeseries.data,
    [ResourceTypes.Sequence]: sequences.data,
    [ResourceTypes.File]: files.data,
    [ResourceTypes.ThreeD]: 0,
    [ResourceTypes.Charts]: 0,
  };

  const isLoading: Record<ResourceType, boolean> = {
    [ResourceTypes.Asset]: assets.isLoading,
    [ResourceTypes.Event]: events.isLoading,
    [ResourceTypes.TimeSeries]: timeseries.isLoading,
    [ResourceTypes.Sequence]: sequences.isLoading,
    [ResourceTypes.File]: files.isLoading,
    [ResourceTypes.ThreeD]: false,
    [ResourceTypes.Charts]: false,
  };

  return { data, isLoading };
};
