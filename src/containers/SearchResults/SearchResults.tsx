import React, { useState, useMemo, useEffect } from 'react';
import { ResourceType } from 'types';
import { Title, Badge } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce/lib';
import { useQuery, useResourceFilters } from 'context/ResourceSelectionContext';
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
import { ResourcePreviewProvider } from 'context';
import {
  SequenceFilterSearch,
  buildSequencesFilterQuery,
} from './SequenceFilterSearch';
import { AssetFilterSearch, buildAssetsFilterQuery } from './AssetFilterSearch';
import { buildFilesFilterQuery, FileFilterSearch } from './FileFilterSearch';
import {
  TimeseriesFilterSearch,
  buildTimeseriesFilterQuery,
} from './TimeseriesFilterSearch';
import { EventFilterSearch, buildEventsFilterQuery } from './EventFilterSearch';
import { Filters } from './Common';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  padding: 16px;
  background: #fff;
  overflow: hidden;
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
`;

const ResourceMap: { [key in ResourceType]: string } = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time Series',
  sequence: 'Sequences',
};

export const SearchResults = ({
  resourceTypes = ['asset', 'file', 'timeSeries', 'event', 'sequence'],
}: {
  resourceTypes?: ResourceType[];
}) => {
  const dispatch = useResourcesDispatch();
  const [activeKey, setActiveKey] = useState<ResourceType>('asset');
  const [query] = useQuery();
  const [debouncedQuery] = useDebounce(query, 100);
  const {
    eventFilter,
    fileFilter,
    timeseriesFilter,
    assetFilter,
    sequenceFilter,
  } = useResourceFilters();

  useEffect(() => {
    dispatch(countEvents(buildEventsFilterQuery(eventFilter, query)));
  }, [dispatch, eventFilter, query]);

  useEffect(() => {
    dispatch(countFiles(buildEventsFilterQuery(fileFilter, query)));
  }, [dispatch, fileFilter, query]);

  useEffect(() => {
    dispatch(countAssets(buildAssetsFilterQuery(assetFilter, query)));
  }, [dispatch, assetFilter, query]);

  useEffect(() => {
    dispatch(countSequences(buildSequencesFilterQuery(sequenceFilter, query)));
  }, [dispatch, sequenceFilter, query]);

  useEffect(() => {
    dispatch(
      countTimeseries(buildTimeseriesFilterQuery(timeseriesFilter, query))
    );
  }, [dispatch, timeseriesFilter, query]);

  const assetCount = useResourcesSelector(countAssetsSelector)(
    buildAssetsFilterQuery(assetFilter, query)
  );
  const fileCount = useResourcesSelector(countFilesSelector)(
    buildFilesFilterQuery(fileFilter, query)
  );
  const sequenceCount = useResourcesSelector(countSequencesSelector)(
    buildSequencesFilterQuery(sequenceFilter, query)
  );
  const eventCount = useResourcesSelector(countEventsSelector)(
    buildEventsFilterQuery(eventFilter, query)
  );
  const timeseriesCount = useResourcesSelector(countTimeseriesSelector)(
    buildTimeseriesFilterQuery(timeseriesFilter, query)
  );

  const resourcesCount: { [key in ResourceType]: string } = {
    asset: `${assetCount.count || 0}`,
    file: `${fileCount.count || 0}`,
    event: `${eventCount.count || 0}`,
    timeSeries: `${timeseriesCount.count || 0}`,
    sequence: `${sequenceCount.count || 0}`,
  };

  const content = useMemo(() => {
    switch (activeKey) {
      case 'asset':
        return <AssetFilterSearch query={debouncedQuery} />;
      case 'file':
        return <FileFilterSearch query={debouncedQuery} />;
      case 'sequence':
        return <SequenceFilterSearch query={debouncedQuery} />;
      case 'timeSeries':
        return <TimeseriesFilterSearch query={debouncedQuery} />;
      case 'event':
        return <EventFilterSearch query={debouncedQuery} />;
      default:
        return null;
    }
  }, [activeKey, debouncedQuery]);

  return (
    <ResourcePreviewProvider>
      <Wrapper>
        <Filters>
          <Title level={4} style={{ marginBottom: 12 }}>
            Resource Types
          </Title>
          {resourceTypes.map(el => (
            <ListItem
              key={el}
              onClick={() => setActiveKey(el as ResourceType)}
              selected={activeKey === el}
              title={ResourceMap[el]}
            >
              <Badge text={`${resourcesCount[el]}`} />
            </ListItem>
          ))}
        </Filters>
        <div className="content">{content}</div>
      </Wrapper>
    </ResourcePreviewProvider>
  );
};
