import isEmpty from 'lodash/isEmpty';

import { Button, formatDate, Skeleton } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';

import { SearchResults } from '../../../components/search/SearchResults';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTimeseriesSearchQuery } from '../../../services/instances/timeseries';

import { PAGE_SIZE } from './constants';

export const TimeseriesResults = () => {
  const { t } = useTranslation();
  const navigate = useNavigation();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useTimeseriesSearchQuery(PAGE_SIZE);

  if (isLoading) {
    return <Skeleton.List lines={3} />;
  }

  return (
    <SearchResults empty={isEmpty(data)}>
      <SearchResults.Header title="Time series" />

      <SearchResults.Body>
        {data.map((item) => (
          <SearchResults.Item
            key={item.id}
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
                    timeseriesId={item.id}
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
