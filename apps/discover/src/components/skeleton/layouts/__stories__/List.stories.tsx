import List from '../List';

export default {
  title: 'Components / Skeleton',
};

const props = {
  lines: 3,
  borders: false,
};

export const Base = () => {
  return <List {...props} />;
};

export const WithBorders = () => {
  return <List {...props} borders />;
};
