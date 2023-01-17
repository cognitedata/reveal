import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import updateLocale from 'dayjs/plugin/updateLocale';
import { EmptyFilledCell } from 'components/RKOMTable/EmptyFilledCell';
import { ExpanderCell } from 'components/RKOMTable/ExpanderCell';
import { Column } from 'react-table';
import { DEFAULT_CONFIG, RkomConfig } from '@cognite/power-ops-api-types';

dayjs.extend(isoWeek);
dayjs.extend(updateLocale);

const updateStartOfWeek = (marketConfig?: RkomConfig['marketConfiguration']) =>
  dayjs.updateLocale('en', {
    weekStart: Number(marketConfig?.start_of_week) || DEFAULT_CONFIG.WEEK_START,
  });

export const getLocalizedWeekDays = (
  marketConfig?: RkomConfig['marketConfiguration']
) => {
  updateStartOfWeek(marketConfig);
  const today = dayjs().tz(marketConfig?.timezone || DEFAULT_CONFIG.TIME_ZONE);
  const friday1200 = today.startOf('week').add(4, 'days').add(12, 'hour');
  const thursday1200 = today.startOf('week').add(3, 'days').add(12, 'hour');
  return { today, friday1200, thursday1200 };
};

export const getFirstDayofDefaultWeek = (
  marketConfig?: RkomConfig['marketConfiguration']
) => {
  updateStartOfWeek(marketConfig);
  const today = dayjs().tz(marketConfig?.timezone || DEFAULT_CONFIG.TIME_ZONE);
  const thursday1200 = today.startOf('week').add(3, 'days').add(12, 'hour');
  const firstDayOfCurrentWeek = today.startOf('week');
  // If today is after 12:00 Thursday, default week is next week
  return today.toISOString() >= thursday1200.toISOString()
    ? today.add(1, 'week').startOf('week')
    : firstDayOfCurrentWeek;
};

export const getDeliveryWeekOptions = (
  marketConfig?: RkomConfig['marketConfiguration']
) => {
  updateStartOfWeek(marketConfig);
  const today = dayjs().tz(marketConfig?.timezone || DEFAULT_CONFIG.TIME_ZONE);
  const firstDayOfCurrentWeek = today.startOf('week');
  const lastDayOfCurrentWeek = firstDayOfCurrentWeek.endOf('week');
  return [-2, -1, 0, 1, 2].map((n) => ({
    weekNumber: firstDayOfCurrentWeek.add(n, 'week').isoWeek(),
    startDate: firstDayOfCurrentWeek.add(n, 'week').format('YYYY-MM-DD'),
    endDate: lastDayOfCurrentWeek.add(n, 'week').format('YYYY-MM-DD'),
  }));
};

export const auctionOptions = [
  { value: 'week' as const, label: 'Weekday' },
  { value: 'weekend' as const, label: 'Weekend' },
];

export const blockOptions = [
  { value: 'day' as const, label: 'Day' },
  { value: 'night' as const, label: 'Night' },
];

export const productOptions = [
  { value: 'up' as const, label: 'Up' },
  { value: 'down' as const, label: 'Down' },
];

export const RKOMTableColumns: Array<Column<object>> = [
  {
    Header: 'Watercourse / Method',
    accessor: 'name',
    id: 'name',
    Cell: ExpanderCell,
  },
  {
    Header: 'Generated',
    accessor: 'generationDate',
    Cell: EmptyFilledCell,
  },
  {
    Header: 'Bid date',
    accessor: 'bidDate',
    Cell: EmptyFilledCell,
  },
  {
    Header: 'Price minimum',
    accessor: 'minimumPrice',
    Cell: EmptyFilledCell,
  },
  {
    Header: 'Price premium',
    accessor: 'premiumPrice',
    Cell: EmptyFilledCell,
  },
  // {
  //   Header: 'Penalties',
  //   accessor: 'penalties',
  //   Cell: penaltiesCell,
  // },
];
