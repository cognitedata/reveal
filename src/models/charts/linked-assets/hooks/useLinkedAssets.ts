import { Asset } from '@cognite/sdk';
import dayjs from 'dayjs';
import LinkedAssetsSidebar from 'components/LinkedAssetsSidebar/LinkedAssetsSidebar';
import useAssetsTimeseries from 'models/cdf/assets/queries/useAssetsTimeseries';
import useTimeseriesAggregatedDatapoints from 'models/cdf/timeseries/queries/useTimeseriesAggregatedDatapoints';
import { ComponentProps } from 'react';
import useSimpleMemo from 'hooks/useSimpleMemo';
import isTruthy from 'utils/isTruthy';
import linkedAssetsSelector from '../selectors/linkedAssetsSelector';

/**
 * # Linked Assets Data Model
 * ## Model Purpose
 * The purpose of this model is to prepare the data so the [linked assets sidebar](../../../../containers/LInkedAssetsSidebar/ConnectedLinkedAssetsSidebar.tsx) can work properly
 * @param {Asset[]} cdfAssets - Array of CDF Asset Id's to fetch the data from
 * @param {Date} startDate - Start Date to fetch the sparkline datapoints for each timeseries in the list. ** Must be stable between renders! **
 * @param {Date} endDate - Start Date to fetch the sparkline datapoints for each timeseries in the list
 * @returns `assets` prop for the  `LinkedAssetsSidebar` Component
 */
export default function useLinkedAssets(
  cdfAssets: Asset[],
  startDate = dayjs().subtract(1, 'year').startOf('day').toDate(),
  endDate = dayjs().endOf('day').toDate()
): ComponentProps<typeof LinkedAssetsSidebar>['assets'] {
  const cdfAssetsTimeseriesQueries = useAssetsTimeseries(cdfAssets);
  const memoizedTimeseries = useSimpleMemo(
    cdfAssetsTimeseriesQueries
      .map(
        ({ data }) =>
          data?.list.map(({ id, isString }) => !isString && id) ?? []
      )
      .flat()
      .filter(isTruthy)
  );
  const cdfDatapointsQueries = useTimeseriesAggregatedDatapoints(
    memoizedTimeseries,
    startDate,
    endDate
  );

  return linkedAssetsSelector(
    cdfAssets,
    cdfAssetsTimeseriesQueries,
    cdfDatapointsQueries
  );
}
