import { Flex } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { ComponentProps, useEffect, useState } from 'react';
import DateTimeRangeSelector from './DateTimeRangeSelector';
import TimePeriodSelector, { relativeTimeOptions } from './TimePeriodSelector';

type Props = ComponentProps<typeof DateTimeRangeSelector>;

const DateTimePicker = (props: Props) => {
  const [selectedPeriodOption, setSelectedPeriodOption] = useState<{
    lastSetRange?: typeof props.range;
    selectedPeriod: typeof relativeTimeOptions[number]['label'] | '';
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

  return (
    <Flex>
      <TimePeriodSelector
        optionSelected={selectedPeriodOption.selectedPeriod}
        onPeriodClick={(period) => {
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
        }}
        style={{ marginRight: 12 }}
      />
      <DateTimeRangeSelector {...props} />
    </Flex>
  );
};

export default DateTimePicker;
