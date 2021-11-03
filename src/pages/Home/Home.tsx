import React, { useEffect } from 'react';
import { useUserContext } from '@cognite/cdf-utilities';
import { handleUserIdentification } from 'utils/config';
import { Page } from 'components/Page';
import ClassifierWidget from './components/widgets/ClassifierWidget';

const Home = () => {
  const user = useUserContext();
  // const metrics = useMetrics('Document-Search-UI');

  useEffect(() => {
    handleUserIdentification(user.username);
  }, [user]);

  return (
    <Page Widget={<ClassifierWidget />}>
      <p>Your Unified UI Subapp is now running! Congrats {user.username}!</p>
    </Page>
  );
};

export default Home;
