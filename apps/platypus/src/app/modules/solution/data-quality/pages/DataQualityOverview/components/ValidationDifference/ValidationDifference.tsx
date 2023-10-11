import { Flex, Micro } from '@cognite/cogs.js';
import { Datapoints, DoubleDatapoint } from '@cognite/sdk/dist/src';

import { useTranslation } from '../../../../../../../hooks/useTranslation';
import { TimeSeriesType } from '../../../../utils/validationTimeseries';

import { DifferenceChip } from './DifferenceChip';

type ValidationDifferenceProps = {
  tsDatapoints?: Datapoints;
  showExtraText?: boolean;
  showStaleState?: boolean;
};

/** Component to show the difference between two datapoints.
 * Can be used for both score and total instances. */
export const ValidationDifference = ({
  tsDatapoints,
  showExtraText = false,
  showStaleState = false,
}: ValidationDifferenceProps) => {
  const { t } = useTranslation('ValidationDifference');

  const differenceAvailable = (tsDatapoints?.datapoints?.length || 0) > 1;

  const currentDatapoint = tsDatapoints?.datapoints[0] as DoubleDatapoint;
  const previousDatapoint = tsDatapoints?.datapoints[1] as DoubleDatapoint;

  // Used to format the value string
  const tsType = tsDatapoints?.externalId?.includes('_score')
    ? TimeSeriesType.SCORE
    : TimeSeriesType.TOTAL_ITEMS_COUNT;

  return (
    differenceAvailable && (
      <Flex alignItems="center" direction="row" gap={8}>
        <DifferenceChip
          currentDatapoint={currentDatapoint}
          previousDatapoint={previousDatapoint}
          showStaleState={showStaleState}
          timeseriesType={tsType}
        />
        {showExtraText && (
          <Micro muted>
            {t(
              'data_quality_since_last_validation',
              'since previous validation'
            )}
          </Micro>
        )}
      </Flex>
    )
  );
};
