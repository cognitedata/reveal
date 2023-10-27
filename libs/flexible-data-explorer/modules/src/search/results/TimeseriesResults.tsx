import React from 'react';

import { EmptyState, Link, SearchResults } from '@fdx/components';
import { useTimeseriesSearchQuery } from '@fdx/services/instances/timeseries';
import { useSearchFilterParams } from '@fdx/shared/hooks/useParams';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Button, formatDate, Skeleton } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';

import { InstancePreview } from '../../preview/InstancePreview';
import { RelationshipFilter } from '../../widgets/RelationshipEdges/Filters';

import { PAGE_SIZE, PAGE_SIZE_SELECTED } from './constants';

interface Props {
  selected?: boolean;
}

export const TimeseriesResults: React.FC<Props> = ({ selected }) => {
  const { t } = useTranslation();

  const [filters, setFilters] = useSearchFilterParams();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useTimeseriesSearchQuery(selected ? PAGE_SIZE_SELECTED : PAGE_SIZE);

  if (isLoading) {
    return <Skeleton.List lines={3} />;
  }

  return (
    <SearchResults data-testid="timeseries-results">
      <SearchResults.Header title="Time series">
        <RelationshipFilter
          dataType="Timeseries"
          value={filters?.['Timeseries']}
          onChange={(value, action) => {
            const nextFilters = {
              ...filters,
              Timeseries: value,
            };

            setFilters(
              nextFilters,
              action === 'add' ? 'TimeSeries' : undefined
            );
          }}
        />
      </SearchResults.Header>

      <SearchResults.Body>
        {data.length === 0 && (
          <EmptyState
            title={t('SEARCH_RESULTS_EMPTY_TITLE')}
            body={t('SEARCH_RESULTS_EMPTY_BODY')}
          />
        )}

        {data.map((item) => (
          <InstancePreview.Timeseries
            key={item.id}
            id={item.externalId || item.id}
          >
            <Link.TimeseriesPage externalId={item.externalId || item.id}>
              <SearchResults.Item
                name={
                  item.name ||
                  item.externalId ||
                  String(item.id) ||
                  'No description'
                }
                description={item.description}
                properties={[
                  {
                    value: (
                      <TimeseriesChart
                        timeseries={{ id: item.id }}
                        variant="small"
                        numberOfPoints={100}
                        height={55}
                        styles={{
                          width: 175,
                        }}
                        dataFetchOptions={{
                          mode: 'aggregate',
                        }}
                        autoRange
                      />
                    ),
                  },
                  {
                    key: 'Created Time',
                    value: formatDate(new Date(item.createdTime).getTime()),
                  },
                ]}
              />
            </Link.TimeseriesPage>
          </InstancePreview.Timeseries>
        ))}
      </SearchResults.Body>

      <SearchResults.Footer>
        <Button
          type="secondary"
          hidden={!hasNextPage}
          onClick={() => {
            fetchNextPage();
          }}
          loading={isFetchingNextPage}
        >
          {t('GENERAL_SHOW_MORE')}
        </Button>
      </SearchResults.Footer>
    </SearchResults>
  );
};
