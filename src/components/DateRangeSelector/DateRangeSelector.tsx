import { DateRange } from '@cognite/cogs.js';
import { trackUsage } from 'services/metrics';
import TimeSelector from 'components/TimeSelector/TimeSelector';

type dateOption = {
  dateFrom: Date;
  dateTo: Date;
};

type Props = {
  dateFrom: Date;
  dateTo: Date;
  handleDateChange: (diff: Partial<dateOption>) => void;
};

const DateRangeSelector = ({ dateFrom, dateTo, handleDateChange }: Props) => {
  return (
    <DateRange
      format="MMM D, YYYY"
      range={{
        startDate: new Date(dateFrom || new Date()),
        endDate: new Date(dateTo || new Date()),
      }}
      onChange={({
        startDate,
        endDate,
      }: {
        startDate?: Date | undefined;
        endDate?: Date | undefined;
      }) => {
        const currentStart = new Date(dateFrom);
        const currentEnd = new Date(dateTo);

        const newStart = new Date(startDate || new Date());
        newStart.setHours(currentStart.getHours());
        newStart.setMinutes(currentStart.getMinutes());

        const newEnd = new Date(endDate || new Date());
        newEnd.setHours(currentEnd.getHours());
        newEnd.setMinutes(currentEnd.getMinutes());

        handleDateChange({
          dateFrom: newStart,
          dateTo: newEnd,
        });

        // Force mouseup event as it doesn't bubble up for this component
        window.dispatchEvent(new Event('mouseup'));
        trackUsage('ChartView.DateChange', { source: 'daterange' });
      }}
      prependComponent={() => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
          }}
        >
          <div>
            <TimeSelector
              value={new Date(dateFrom)}
              onChange={(value) => {
                handleDateChange({
                  dateFrom: value,
                });
              }}
            />
          </div>
          <div>
            <TimeSelector
              value={new Date(dateTo)}
              onChange={(value) => {
                handleDateChange({
                  dateTo: value,
                });
              }}
            />
          </div>
        </div>
      )}
    />
  );
};

export default DateRangeSelector;
