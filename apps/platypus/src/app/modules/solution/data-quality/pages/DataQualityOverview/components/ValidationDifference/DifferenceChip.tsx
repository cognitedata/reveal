import { Chip } from '@cognite/cogs.js';
import { DoubleDatapoint } from '@cognite/sdk/dist/src';

import { useTranslation } from '../../../../../../../hooks/useTranslation';
import { abbreviateNumber } from '../../../../utils/numbers';
import {
  TimeSeriesType,
  getScoreValue,
} from '../../../../utils/validationTimeseries';

type DifferenceChipProps = {
  currentDatapoint?: DoubleDatapoint;
  previousDatapoint?: DoubleDatapoint;
  showStaleState?: boolean;
  timeseriesType: TimeSeriesType;
};

export const DifferenceChip = ({
  currentDatapoint,
  previousDatapoint,
  showStaleState = false, // A state is stale if there were no changes compared to its previous state
  timeseriesType,
}: DifferenceChipProps) => {
  const { t } = useTranslation('DifferenceChip');

  if (!currentDatapoint || !previousDatapoint) return null;

  const difference = currentDatapoint?.value - previousDatapoint?.value;

  const differenceType = getDifferenceType(difference);
  const differenceArrow = getDifferenceArrow(difference);
  const differenceValue =
    timeseriesType === TimeSeriesType.SCORE
      ? getScoreValue(difference)
      : getDifferenceValue(difference);

  const hideStaleChip = !showStaleState && difference === 0;

  return (
    !hideStaleChip && (
      <Chip
        icon={differenceArrow}
        iconPlacement="right"
        label={differenceValue}
        size="small"
        tooltipProps={{
          content: t(
            'data_quality_validation_difference',
            `${differenceValue} difference since previous validation`,
            { differenceValue }
          ),
        }}
        type={differenceType}
      />
    )
  );
};

const getDifferenceType = (difference: number) => {
  if (difference > 0) {
    return 'success';
  }
  if (difference < 0) {
    return 'danger';
  }

  return 'default';
};

const getDifferenceArrow = (difference: number) => {
  if (difference > 0) {
    return 'ArrowUpRight';
  }
  if (difference < 0) {
    return 'ArrowDownRight';
  }

  return undefined;
};

const getDifferenceValue = (difference: number) => {
  const value = abbreviateNumber(difference).toLocaleString();

  if (difference < 0) {
    return `-${value}`;
  }

  return value;
};
