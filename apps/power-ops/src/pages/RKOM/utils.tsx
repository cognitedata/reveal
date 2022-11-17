import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import updateLocale from 'dayjs/plugin/updateLocale';
import { EmptyFilledCell } from 'components/RKOMTable/EmptyFilledCell';
import { ExpanderCell } from 'components/RKOMTable/ExpanderCell';
import { Column } from 'react-table';

dayjs.extend(isoWeek);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekStart: 1,
});

// TODO(POWEROPS-780): timezone needs to come from Market Config in CDF
export const today = dayjs().tz('Europe/Oslo');

export const thursday1200 = today
  .startOf('week')
  .add(3, 'days')
  .add(12, 'hour');

export const friday1200 = today.startOf('week').add(4, 'days').add(12, 'hour');

const firstDayOfCurrentWeek = today.startOf('week');
const lastDayOfCurrentWeek = firstDayOfCurrentWeek.endOf('week');
const currentWeekNumber = firstDayOfCurrentWeek.isoWeek();

// If today is after 12:00 Thursday, default week is next week
export const firstDayofDefaultWeek =
  today.toISOString() >= thursday1200.toISOString()
    ? today.add(1, 'week').startOf('week')
    : firstDayOfCurrentWeek;

export const deliveryWeekOptions = [-2, -1, 0, 1, 2].map((n) => ({
  weekNumber: currentWeekNumber + n,
  startDate: firstDayOfCurrentWeek.add(n, 'week').format('YYYY-MM-DD'),
  endDate: lastDayOfCurrentWeek.add(n, 'week').format('YYYY-MM-DD'),
}));

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
