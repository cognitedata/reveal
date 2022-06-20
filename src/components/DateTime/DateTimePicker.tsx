import { Flex } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import DateTimeRangeSelector from './DateTimeRangeSelector';
import TimePeriodSelector from './TimePeriodSelector';

type Props = ComponentProps<typeof DateTimeRangeSelector>;

const DateTimePicker = (props: Props) => {
  const optionsSelected = () => {
    const diff =
      props.range.endDate.getTime() - props.range.startDate.getTime();
    switch (diff) {
      case 86400000:
        return '1d';
      case 172800000:
        return '2d';
      case 604800000:
        return '1w';
      case 2592000000:
        return '1M';
      case 15634800000:
        return '6M';
      case 31536000000:
        return '1y';
      default:
        return '';
    }
  };

  return (
    <Flex>
      <TimePeriodSelector
        optionSelected={optionsSelected()}
        onPeriodClick={(period) => {
          props.onChange({
            startDate: dayjs()
              .subtract(parseInt(period[0], 10), period[1])
              .toDate(),
            endDate: props.range.endDate,
          });
        }}
        style={{ marginRight: 12 }}
      />
      <DateTimeRangeSelector {...props} />
    </Flex>
  );
};

export default DateTimePicker;
