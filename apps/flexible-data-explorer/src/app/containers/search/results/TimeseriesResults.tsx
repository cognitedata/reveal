import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { Button, formatDate, Skeleton } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';

import { EmptyState } from '../../../components/EmptyState';
import { SearchResults } from '../../../components/search/SearchResults';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTimeseriesSearchQuery } from '../../../services/instances/timeseries';
import { InstancePreview } from '../../preview/InstancePreview';

import { PAGE_SIZE, PAGE_SIZE_SELECTED } from './constants';

interface Props {
  selected?: boolean;
}

export const TimeseriesResults: React.FC<Props> = ({ selected }) => {
  const { t } = useTranslation();
  const navigate = useNavigation();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useTimeseriesSearchQuery(selected ? PAGE_SIZE_SELECTED : PAGE_SIZE);

  if (isLoading) {
    return <Skeleton.List lines={3} />;
  }

  if (selected && data.length === 0) {
    return (
      <EmptyState
        title={t('SEARCH_RESULTS_EMPTY_TITLE')}
        body={t('SEARCH_RESULTS_EMPTY_BODY')}
      />
    );
  }

  return (
    <SearchResults empty={isEmpty(data)}>
      <SearchResults.Header title="Time series" />

      <SearchResults.Body>
        {data.map((item) => (
          <InstancePreview.Timeseries
            key={item.id}
            id={item.externalId || item.id}
          >
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
              onClick={() => {
                navigate.toTimeseriesPage(item.externalId || item.id);
              }}
            />
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
