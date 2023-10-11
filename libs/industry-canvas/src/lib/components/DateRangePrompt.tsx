import { useState } from 'react';

import styled from 'styled-components';

import { Checkbox, DateRange } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { useTranslation } from '../hooks/useTranslation';

const StyledCheckbox = styled(Checkbox)`
  margin-bottom: 8px;
`;

type Range = {
  startDate: Date;
  endDate: Date;
};

type DateRangePromptProps = {
  initialRange: Range;
  shouldApplyToAllTimeSeries: boolean;
  onToggleShouldApplyToAllTimeSeries: () => void;
  onComplete: (dateRange: Range, shouldApplyToAllTimeSeries: boolean) => void;
};

/**
 * This is a thin wrapper around the cogs DateRange component that allows us to only propagate
 * changes when the apply button has been pressed, rather than at each date change.
 * @param initialRange
 * @constructor
 */
const DateRangePrompt: React.FC<DateRangePromptProps> = ({
  initialRange,
  shouldApplyToAllTimeSeries,
  onToggleShouldApplyToAllTimeSeries,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<Range>(initialRange);
  return (
    <StyledDateRange>
      <DateRange
        format="YYYY/MM/DD"
        range={dateRange}
        onChange={(nextDateRange) => {
          setDateRange((prevDateRange) => ({
            ...prevDateRange,
            startDate: nextDateRange.startDate || prevDateRange.startDate,
            endDate: nextDateRange.endDate || prevDateRange.endDate,
          }));
        }}
        appendComponent={() => (
          <StyledCheckbox
            label={t(
              translationKeys.APPLY_TO_ALL_TIME_SERIES_IN_CANVAS,
              'Apply to all time series in canvas'
            )}
            checked={shouldApplyToAllTimeSeries}
            onChange={onToggleShouldApplyToAllTimeSeries}
          />
        )}
        onApplyClick={() => onComplete(dateRange, shouldApplyToAllTimeSeries)}
      />
    </StyledDateRange>
  );
};

export default DateRangePrompt;

const StyledDateRange = styled.div`
  .cogs-date-range--input {
    height: 33px;
    background: var(--cogs-surface--action--muted--default);

    border: 1px solid transparent;
    &:hover {
      border: 1px solid var(--cogs-midblue-4);
    }
  }

  .cogs-input.cogs-input-default:focus {
    background: inherit;
  }

  .cogs-date-range--input .cogs-tab-input > * {
    margin: 0 -7px;
  }

  .cogs-date-range--input .cogs-tab-input > .input-icon.calendar {
    margin-right: 2px;
    margin-left: 8px;
  }
`;
