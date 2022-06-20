import { DateRange, Flex } from '@cognite/cogs.js';
import { ComponentProps } from 'react';
import TimeSelector from './TimeSelector';

/**
 * Redefine the range prop to avoid sending empty values to it
 */
type Range = {
  startDate: Date;
  endDate: Date;
};

interface Props
  extends Omit<ComponentProps<typeof DateRange>, 'range' | 'onChange'> {
  range: Range;
  onChange: (range: Range) => void;
}

const DateTimeRangeSelector = ({ range, onChange, ...rest }: Props) => {
  return (
    <DateRange
      range={range}
      format="L"
      onChange={(newRange) => {
        const startDate = new Date(newRange.startDate ?? new Date());
        startDate.setHours(range.startDate.getHours());
        startDate.setMinutes(range.startDate.getMinutes());

        const endDate = new Date(newRange.endDate ?? new Date());
        endDate.setHours(range.endDate.getHours());
        endDate.setMinutes(range.endDate.getMinutes());

        onChange({ startDate, endDate });

        // Force mouseup event as it doesn't bubble up for this component
        window.dispatchEvent(new Event('mouseup'));
      }}
      prependComponent={() => (
        <Flex justifyContent="space-evenly">
          <TimeSelector
            value={range.startDate}
            onChange={(value) => {
              const startDate = new Date(range.startDate);
              startDate.setHours(value.getHours());
              startDate.setMinutes(value.getMinutes());
              onChange({
                startDate,
                endDate: range.endDate,
              });
            }}
          />
          <TimeSelector
            value={range.endDate}
            onChange={(value) => {
              const endDate = new Date(range.endDate);
              endDate.setHours(value.getHours());
              endDate.setMinutes(value.getMinutes());
              onChange({
                startDate: range.startDate,
                endDate,
              });
            }}
          />
        </Flex>
      )}
      {...rest}
    />
  );
};

export default DateTimeRangeSelector;
