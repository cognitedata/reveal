import { Flex } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { ComponentProps, useEffect, useState } from 'react';
import DateTimeRangeSelector from './DateTimeRangeSelector';
import { RelativeTimeOption } from './types';
import TimePeriodSelector from './TimePeriodSelector';
import { TimePeriodMenu } from './TimePeriodMenu';

type Props = ComponentProps<typeof DateTimeRangeSelector> & {
  hideTimePeriodSelector?: boolean;
};

const DateTimePicker = (props: Props) => {
  const [selectedPeriodOption, setSelectedPeriodOption] = useState<{
    lastSetRange?: typeof props.range;
    selectedPeriod: RelativeTimeOption;
  }>({
    lastSetRange: undefined,
    selectedPeriod: '',
  });

  const rangeWasChanged =
    JSON.stringify(props.range) !==
    JSON.stringify(selectedPeriodOption.lastSetRange);

  useEffect(() => {
    if (rangeWasChanged) {
      setSelectedPeriodOption({ lastSetRange: undefined, selectedPeriod: '' });
    }
  }, [rangeWasChanged]);

  const handlePeriodChange = (period: RelativeTimeOption) => {
    const nowDate = new Date();
    const startDate = dayjs(nowDate)
      .subtract(parseInt(period[0], 10), period[1])
      .toDate();

    const newRange = {
      startDate,
      endDate: nowDate,
    };

    props.onChange(newRange);

    setSelectedPeriodOption({
      lastSetRange: newRange,
      selectedPeriod: period,
    });
  };

  return (
    <Flex alignItems="center" justifyContent="center">
      {!props?.hideTimePeriodSelector && (
        <TimePeriodSelector
          optionSelected={selectedPeriodOption.selectedPeriod}
          onPeriodChange={handlePeriodChange}
          style={{ marginRight: 12 }}
        />
      )}

      <DateTimeRangeSelector {...props} />

      {props.hideTimePeriodSelector && (
        <TimePeriodMenu
          onPeriodChange={handlePeriodChange}
          optionSelected={selectedPeriodOption.selectedPeriod}
        />
      )}
    </Flex>
  );
};

export default DateTimePicker;
