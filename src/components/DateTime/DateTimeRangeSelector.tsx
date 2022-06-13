import { DateRange, Flex } from '@cognite/cogs.js';
import TimeSelector from './TimeSelector';

type Props = {
  range: {
    startDate: Date;
    endDate: Date;
  };
  onChange: (startDate: Date, endDate: Date) => void;
};

const DateTimeRangeSelector = ({
  range: { startDate, endDate },
  onChange,
}: Props) => {
  return (
    <DateRange
      format="L"
      range={{ startDate, endDate }}
      onChange={(newRange) => {
        const newStart = newRange.startDate ?? new Date();
        newStart.setHours(startDate.getHours());
        newStart.setMinutes(startDate.getMinutes());

        const newEnd = newRange.endDate ?? new Date();
        newEnd.setHours(endDate.getHours());
        newEnd.setMinutes(endDate.getMinutes());

        onChange(newStart, newEnd);
      }}
      prependComponent={() => (
        <Flex justifyContent="space-evenly">
          <TimeSelector
            value={startDate}
            onChange={(value) => {
              const newStart = new Date(startDate);
              newStart.setHours(value.getHours());
              newStart.setMinutes(value.getMinutes());
              onChange(newStart, endDate);
            }}
          />
          <TimeSelector
            value={endDate}
            onChange={(value) => {
              const newEnd = new Date(endDate);
              newEnd.setHours(value.getHours());
              newEnd.setMinutes(value.getMinutes());
              onChange(startDate, newEnd);
            }}
          />
        </Flex>
      )}
    />
  );
};

export default DateTimeRangeSelector;
