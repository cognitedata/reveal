import { HomePageProvider } from 'scarlet/contexts';

import { PageBody } from './components';

export const Home = () => (
  <HomePageProvider>
    <PageBody />
  </HomePageProvider>
);
