import styled from 'styled-components';
import {
  SequenceSummary,
  AssetSummary,
  TimeseriesSummary,
  DocumentSummary,
  EventSummary,
  ResourceType,
} from '@cognite/data-exploration';
import { useCommonFilters } from 'app/store';
import { SEARCH_KEY } from 'app/utils/constants';
import { useCurrentResourceType, useQueryString } from 'app/hooks/hooks';
import { trackUsage } from 'app/utils/Metrics';
import { EXPLORATION } from 'app/constants/metrics';

export const AllTab = () => {
  const [commonFilters] = useCommonFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [_, setCurrentResourceType] = useCurrentResourceType();

  const handleAllResultsClick = (type: ResourceType) => {
    trackUsage(EXPLORATION.CLICK.ALL_RESULTS, { resourceType: type });
    setCurrentResourceType(type);
  };

  return (
    <AllTabContainer>
      <AssetSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('asset', row.id)}
        onAllResultsClick={() => handleAllResultsClick('asset')}
      />
      <EventSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('event', row.id)}
        onAllResultsClick={() => handleAllResultsClick('event')}
      />
      <DocumentSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('document', row.id)}
        onAllResultsClick={() => handleAllResultsClick('document')}
      />
      <TimeseriesSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('timeSeries', row.id)}
        onAllResultsClick={() => handleAllResultsClick('timeSeries')}
      />
      <SequenceSummary
        filter={commonFilters}
        query={query}
        onRowClick={row => setCurrentResourceType('sequence', row.id)}
        onAllResultsClick={() => handleAllResultsClick('sequence')}
      />
    </AllTabContainer>
  );
};

const AllTabContainer = styled.div`
  padding: 16px;
  display: grid;
  grid-gap: 16px;
  height: 100%;
  overflow-y: auto;
  grid-template-columns: 1fr 1fr;

  & > * {
    height: 384px;
    min-width: 300px;
    width: 100%;
  }
  & > *:last-child {
    grid-column: 1 / -1;
  }
`;
