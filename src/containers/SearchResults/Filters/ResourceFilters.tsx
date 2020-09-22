import React, { useEffect } from 'react';
import { ResourceType } from 'types';
import { Title, Badge } from '@cognite/cogs.js';
import { useQuery, useResourceFilters, useResourceTypes } from 'context';
import { ListItem } from 'components/Common';
import {
  useResourcesDispatch,
  useResourcesSelector,
} from '@cognite/cdf-resources-store';
import {
  count as countEvents,
  countSelector as countEventsSelector,
} from '@cognite/cdf-resources-store/dist/events';
import {
  count as countAssets,
  countSelector as countAssetsSelector,
} from '@cognite/cdf-resources-store/dist/assets';
import {
  count as countSequences,
  countSelector as countSequencesSelector,
} from '@cognite/cdf-resources-store/dist/sequences';
import {
  count as countFiles,
  countSelector as countFilesSelector,
} from '@cognite/cdf-resources-store/dist/files';
import {
  count as countTimeseries,
  countSelector as countTimeseriesSelector,
} from '@cognite/cdf-resources-store/dist/timeseries';
import { useDebounce } from 'use-debounce/lib';
import { buildSequencesFilterQuery } from 'containers/Sequences';
import { buildAssetsFilterQuery } from 'containers/Assets';
import { buildFilesFilterQuery } from 'containers/Files';
import { buildTimeseriesFilterQuery } from 'containers/Timeseries';
import { buildEventsFilterQuery } from 'containers/Events';

const ResourceMap: { [key in ResourceType]: string } = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time series',
  sequence: 'Sequences',
};

export const ResourceFilters = ({
  currentResourceType,
  setCurrentResourceType,
}: {
  currentResourceType: ResourceType;
  setCurrentResourceType: (newResourceType: ResourceType) => void;
}) => {
  const dispatch = useResourcesDispatch();
  const [query] = useQuery();
  const [debouncedQuery] = useDebounce(query, 100);
  const {
    eventFilter,
    fileFilter,
    timeseriesFilter,
    assetFilter,
    sequenceFilter,
  } = useResourceFilters();
  const resourceTypes = useResourceTypes();

  useEffect(() => {
    dispatch(countEvents(buildEventsFilterQuery(eventFilter, debouncedQuery)));
  }, [dispatch, eventFilter, debouncedQuery]);

  useEffect(() => {
    dispatch(countFiles(buildEventsFilterQuery(fileFilter, debouncedQuery)));
  }, [dispatch, fileFilter, debouncedQuery]);

  useEffect(() => {
    dispatch(countAssets(buildAssetsFilterQuery(assetFilter, debouncedQuery)));
  }, [dispatch, assetFilter, debouncedQuery]);

  useEffect(() => {
    dispatch(
      countSequences(buildSequencesFilterQuery(sequenceFilter, debouncedQuery))
    );
  }, [dispatch, sequenceFilter, debouncedQuery]);

  useEffect(() => {
    dispatch(
      countTimeseries(
        buildTimeseriesFilterQuery(timeseriesFilter, debouncedQuery)
      )
    );
  }, [dispatch, timeseriesFilter, debouncedQuery]);

  const assetCount = useResourcesSelector(countAssetsSelector)(
    buildAssetsFilterQuery(assetFilter, debouncedQuery)
  );
  const fileCount = useResourcesSelector(countFilesSelector)(
    buildFilesFilterQuery(fileFilter, debouncedQuery)
  );
  const sequenceCount = useResourcesSelector(countSequencesSelector)(
    buildSequencesFilterQuery(sequenceFilter, debouncedQuery)
  );
  const eventCount = useResourcesSelector(countEventsSelector)(
    buildEventsFilterQuery(eventFilter, debouncedQuery)
  );
  const timeseriesCount = useResourcesSelector(countTimeseriesSelector)(
    buildTimeseriesFilterQuery(timeseriesFilter, debouncedQuery)
  );

  const resourcesCount: { [key in ResourceType]: string } = {
    asset: `${assetCount.count || 0}`,
    file: `${fileCount.count || 0}`,
    event: `${eventCount.count || 0}`,
    timeSeries: `${timeseriesCount.count || 0}`,
    sequence: `${sequenceCount.count || 0}`,
  };

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Resource types
      </Title>
      {resourceTypes.map(el => (
        <ListItem
          key={el}
          onClick={() => setCurrentResourceType(el as ResourceType)}
          selected={currentResourceType === el}
          title={ResourceMap[el]}
        >
          <Badge text={`${resourcesCount[el]}`} />
        </ListItem>
      ))}
    </>
  );
};
