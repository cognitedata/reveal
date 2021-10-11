import { Provider } from 'react-redux';

import { store } from '_helpers/store';

import Content from './Content';

const withProvider = (story: any) => (
  <Provider store={store}>{story()}</Provider>
);

export default {
  title: 'Pages / Well search',
  component: Content,
  decorators: [withProvider],
};

export const Result = () => {
  return (
    <>
      <Content />
    </>
  );
};

export const frontPage = () => <Content />;
