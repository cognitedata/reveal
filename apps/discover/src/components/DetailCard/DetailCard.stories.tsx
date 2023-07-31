import { DetailCard } from './DetailCard';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / DetailCard',
  component: DetailCard,
};

const data = [
  { color: 'red', title: 'CMS', content: 'Super Important' },
  { title: 'Water Depth', content: '100' },
  { title: 'Start date', content: '14.02.21' },
  { title: 'End date', content: '15.02.21' },
  { title: 'Durations (hrs)', content: '14' },
];

export const simple = () => <DetailCard data={data} />;
