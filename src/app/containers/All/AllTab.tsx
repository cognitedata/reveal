import styled from 'styled-components';
import {
  SequenceSummary,
  AssetSummary,
  TimeseriesSummary,
  DocumentSummary,
  EventSummary,
} from '@cognite/data-exploration';
import { useCommonFilters } from 'app/store';
import { SEARCH_KEY } from 'app/utils/constants';
import { useCurrentResourceType, useQueryString } from 'app/hooks/hooks';

export const AllTab = () => {
  const [commonFilters] = useCommonFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [_, setCurrentResourceType] = useCurrentResourceType();

  return (
    <AllTabContainer>
      <AssetSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('asset', row.id)}
        onAllResultsClick={() => setCurrentResourceType('asset')}
      />
      <EventSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('event', row.id)}
        onAllResultsClick={() => setCurrentResourceType('event')}
      />
      <DocumentSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('document', row.id)}
        onAllResultsClick={() => setCurrentResourceType('document')}
      />
      <TimeseriesSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('timeSeries', row.id)}
        onAllResultsClick={() => setCurrentResourceType('timeSeries')}
      />
      <SequenceSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('sequence', row.id)}
        onAllResultsClick={() => setCurrentResourceType('sequence')}
      />
    </AllTabContainer>
  );
};

const AllTabContainer = styled.div`
  padding: 16px;
  display: grid;
  grid-gap: 8px;
  height: 100%;
  overflow-y: auto;
  grid-template-columns: 1fr 1fr;

  & > * {
    height: 400px;
    min-width: 300px;
    width: 100%;
  }
  & > *:last-child {
    grid-column: 1 / -1;
  }
`;
