import { useState } from 'react';

import { isValidDate } from 'utils/date';

import { Button, Range } from '@cognite/cogs.js';

import { CommonDateRange } from '../../components/CommonDateRange';

import {
  DateRangeFooterWrapper,
  DateRangeTitle,
  WellDateRangeWrapper,
} from './elements';

export type DateRange = (Date | undefined)[];

type Props = {
  title: string;
  minMaxRange: DateRange;
  range: DateRange;
  onChange: (range: DateRange) => void;
};
export const DateRangeFilter = ({
  title,
  range = [],
  minMaxRange = [],
  onChange,
}: Props) => {
  const [dateState, setDateState] = useState<Range>({
    startDate: isValidDate(range[0] as Date) ? range[0] : undefined,
    endDate: isValidDate(range[1] as Date) ? range[1] : undefined,
  });

  const minMax = {
    startDate: isValidDate(minMaxRange[0] as Date) ? minMaxRange[0] : undefined,
    endDate: isValidDate(minMaxRange[1] as Date) ? minMaxRange[1] : undefined,
  };

  const apply = () => {
    onChange([dateState?.startDate, dateState?.endDate]);
  };

  const clear = () => {
    setDateState({});
    onChange([]);
  };

  const renderClearButton = () => (
    <DateRangeFooterWrapper>
      <Button type="ghost" onClick={clear}>
        Clear
      </Button>
      <Button type="primary" onClick={apply}>
        Apply
      </Button>
    </DateRangeFooterWrapper>
  );

  return (
    <WellDateRangeWrapper>
      {title && <DateRangeTitle>{title}</DateRangeTitle>}
      <CommonDateRange
        range={dateState}
        minMaxRange={minMax}
        appendComponent={renderClearButton}
        onChange={setDateState}
      />
    </WellDateRangeWrapper>
  );
};
