import React from 'react';
import { Loader } from '@cognite/cogs.js';
import Routes from 'components/Routes';
import TopBar from 'components/TopBar';
import Search from 'components/Search';
import PageLayout from 'components/Layout/PageLayout';
import useSelector from 'hooks/useSelector';
import useLogin from './useLogin';

type AppAuthProps = {
  tenant: string;
};

const App = ({ tenant }: AppAuthProps) => {
  const { authenticating } = useLogin({ project: tenant });
  const firebaseReady = useSelector((state) => state.environment.firebaseReady);

  if (authenticating || !firebaseReady) {
    return <Loader />;
  }

  return (
    <PageLayout>
      <Search />
      <TopBar />
      <main>
        <Routes />
      </main>
    </PageLayout>
  );
};

export default App;
