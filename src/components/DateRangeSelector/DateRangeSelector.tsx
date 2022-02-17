import { DateRange } from '@cognite/cogs.js';
import TimeSelector from 'components/TimeSelector';
import { trackUsage } from 'services/metrics';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { updateChartDateRange } from 'models/chart/updates';

const DateRangeSelector = () => {
  const [chart, setChart] = useRecoilState(chartAtom);

  if (!chart) {
    return null;
  }

  const handleDateChange = ({
    dateFrom,
    dateTo,
  }: {
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    if (dateFrom || dateTo) {
      setChart((oldChart) => updateChartDateRange(oldChart!, dateFrom, dateTo));
      trackUsage('ChartView.DateChange', { source: 'daterange' });
    }
  };

  return (
    <DateRange
      format="MMM D, YYYY"
      range={{
        startDate: new Date(chart.dateFrom || new Date()),
        endDate: new Date(chart.dateTo || new Date()),
      }}
      onChange={({
        startDate,
        endDate,
      }: {
        startDate?: Date | undefined;
        endDate?: Date | undefined;
      }) => {
        const currentStart = new Date(chart.dateFrom);
        const currentEnd = new Date(chart.dateTo);

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
              value={new Date(chart.dateFrom)}
              onChange={(value) => {
                handleDateChange({
                  dateFrom: value,
                });
              }}
            />
          </div>
          <div>
            <TimeSelector
              value={new Date(chart.dateTo)}
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
