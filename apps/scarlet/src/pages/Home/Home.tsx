import { HomePageProvider } from 'contexts';

import { PageBody } from './components';

export const Home = () => (
  <HomePageProvider>
    <PageBody />
  </HomePageProvider>
);
