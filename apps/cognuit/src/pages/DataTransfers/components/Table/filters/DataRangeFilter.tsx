import { DateRange } from '@cognite/cogs.js';
import { useMemo } from 'react';
import { toRawDate, toUnixDate } from 'utils/date';

export const DataRangeFilter = ({
  column: {
    filterValue = [undefined, undefined],
    setFilter,
    preFilteredRows,
    id,
  },
}: {
  column: {
    filterValue: [number | undefined, number | undefined];
    setFilter: any;
    preFilteredRows: any[];
    id: any;
  };
}) => {
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row: any) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  const [startDate, endDate] = filterValue;

  return (
    <DateRange
      type="standard"
      calendarHasBorder={false}
      months={1}
      minDate={toUnixDate(min)}
      maxDate={toUnixDate(max)}
      direction="horizontal"
      startDatePlaceholder="From date"
      endDatePlaceholder="To date"
      range={{
        startDate: startDate ? toUnixDate(startDate) : undefined,
        endDate: endDate ? toUnixDate(endDate) : undefined,
      }}
      onChange={({ startDate, endDate }) => {
        setFilter([
          startDate && toRawDate(startDate),
          endDate && toRawDate(endDate, true),
        ]);
      }}
    />
  );
};
