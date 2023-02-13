import styled from 'styled-components';
import {
  SequenceSummary,
  AssetSummary,
  TimeseriesSummary,
  DocumentSummary,
  FileSummary,
  EventSummary,
  ResourceType,
} from '@cognite/data-exploration';
import { useCommonFilters } from '@data-exploration-app/store';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import {
  useCurrentResourceType,
  useQueryString,
} from '@data-exploration-app/hooks/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks/flags/useFlagAdvancedFilters';
import { SearchResultWrapper } from '@data-exploration-app/containers/elements';

export const AllTab = () => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const [commonFilters] = useCommonFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [_, setCurrentResourceType] = useCurrentResourceType();

  const handleAllResultsClick = (type: ResourceType) => {
    trackUsage(EXPLORATION.CLICK.ALL_RESULTS, { resourceType: type });
    setCurrentResourceType(type);
  };

  return (
    <SearchResultWrapper>
      <AllTabContainer>
        <AssetSummary
          filter={commonFilters}
          query={query}
          onRowClick={(row) => setCurrentResourceType('asset', row.id)}
          onAllResultsClick={() => handleAllResultsClick('asset')}
        />
        <TimeseriesSummary
          filter={commonFilters}
          query={query}
          onRowClick={(row) => setCurrentResourceType('timeSeries', row.id)}
          onAllResultsClick={() => handleAllResultsClick('timeSeries')}
        />
        {isAdvancedFiltersEnabled ? (
          <DocumentSummary
            filter={commonFilters}
            query={query}
            onRowClick={(row) => setCurrentResourceType('file', row.id)}
            onAllResultsClick={() => handleAllResultsClick('file')}
          />
        ) : (
          <FileSummary
            filter={commonFilters}
            query={query}
            onRowClick={(row) => setCurrentResourceType('file', row.id)}
            onAllResultsClick={() => handleAllResultsClick('file')}
          />
        )}
        <EventSummary
          filter={commonFilters}
          query={query}
          onRowClick={(row) => setCurrentResourceType('event', row.id)}
          onAllResultsClick={() => handleAllResultsClick('event')}
        />
        <SequenceSummary
          filter={commonFilters}
          query={query}
          onRowClick={(row) => setCurrentResourceType('sequence', row.id)}
          onAllResultsClick={() => handleAllResultsClick('sequence')}
        />
      </AllTabContainer>
    </SearchResultWrapper>
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
    height: 404px;
    min-width: 300px;
    width: 100%;
  }
  & > *:last-child {
    grid-column: 1 / -1;
  }
`;
