import { TimeseriesChart } from '@plotting-components';
import isEmpty from 'lodash/isEmpty';

import { Button, formatDate, Skeleton } from '@cognite/cogs.js';

import { translationKeys } from '../../../common/i18n/translationKeys';
import { SearchResults } from '../../../components/search/SearchResults';
import { useNavigation } from '../../../hooks/useNavigation';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTimeseriesSearchQuery } from '../../../services/instances/timeseries';
import { buildTimeseriesFilter } from '../../../utils/filterBuilder';

import { PAGE_SIZE } from './constants';

export const TimeseriesResults = () => {
  const { t } = useTranslation();
  const navigate = useNavigation();
  const [query] = useSearchQueryParams();
  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useTimeseriesSearchQuery(
      query,
      PAGE_SIZE,
      buildTimeseriesFilter(timeseriesFilterParams)
    );

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
          {t(translationKeys.showMore, 'Show more')}
        </Button>
      </SearchResults.Footer>
    </SearchResults>
  );
};
