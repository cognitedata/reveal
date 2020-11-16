import React from 'react';
import { Loader } from '@cognite/cogs.js';
import Routes from 'components/Routes';
import TopBar from 'components/TopBar';
import PageLayout from 'components/Layout/PageLayout';
import useLogin from './useLogin';

type AppAuthProps = {
  tenant: string;
};

const App = ({ tenant }: AppAuthProps) => {
  const { authenticating } = useLogin({ project: tenant });

  if (authenticating) {
    return <Loader />;
  }

  return (
    <PageLayout>
      <TopBar />
      <main>
        <Routes />
      </main>
    </PageLayout>
  );
};

export default App;
