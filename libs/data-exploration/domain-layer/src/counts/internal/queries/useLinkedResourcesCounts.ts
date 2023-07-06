import { ResourceType, ResourceTypes } from '@data-exploration-lib/core';

import { BaseResource, Counts } from '../types';
import { getResourceId } from '../utils';

import { useLinkedAssetsCount } from './useLinkedAssetsCount';
import { useLinkedEventsCount } from './useLinkedEventsCount';
import { useLinkedFilesCount } from './useLinkedFilesCount';
import { useLinkedSequencesCount } from './useLinkedSequencesCount';
import { useLinkedTimeseriesCount } from './useLinkedTimeseriesCount';

export const useLinkedResourcesCounts = ({
  resource,
  resourceType,
}: {
  resource?: BaseResource;
  resourceType: ResourceType;
}) => {
  const resourceId = getResourceId(resource);

  const assets = useLinkedAssetsCount(resourceId, resourceType);
  const events = useLinkedEventsCount(resourceId);
  const timeseries = useLinkedTimeseriesCount(resourceId);
  const sequences = useLinkedSequencesCount(resourceId);
  const files = useLinkedFilesCount(resourceId);

  const data: Counts = {
    [ResourceTypes.Asset]: assets.data,
    [ResourceTypes.Event]: events.data,
    [ResourceTypes.TimeSeries]: timeseries.data,
    [ResourceTypes.Sequence]: sequences.data,
    [ResourceTypes.File]: files.data,
  };

  const isLoading =
    assets.isLoading ||
    events.isLoading ||
    timeseries.isLoading ||
    sequences.isLoading ||
    files.isLoading;

  return { data, isLoading };
};
