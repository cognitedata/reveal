import { useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useQuery } from 'react-query';
import { AuthContext } from 'providers/AuthProvider';
import StatusMessage from 'components/StatusMessage';

import HomePage from './HomePage';
import BlueprintPage from './Blueprint';
import NotFoundPage from './Error404';
import RestrictedAccessPage from './RestrictedAccessPage';

const ROUTES = {
  HOME: '/',
  BLUEPRINT: '/blueprint/:externalId',
};

const Routes = () => {
  const { blueprintService } = useContext(AuthContext);

  const { error, isLoading } = useQuery<number, Error>(
    ['validateSetup'],
    () => blueprintService!.validateSetup(),
    {
      enabled: true,
      retry: false,
    }
  );

  if (isLoading) {
    return <StatusMessage type="Loading" />;
  }

  if (error) {
    return <RestrictedAccessPage message={error.message} />;
  }

  return (
    <Switch>
      <Route path={ROUTES.BLUEPRINT} render={() => <BlueprintPage />} />
      <Route path={ROUTES.HOME} render={() => <HomePage />} />
      <Redirect from="" to={ROUTES.HOME} />
      <Route render={() => <NotFoundPage />} />
    </Switch>
  );
};

export default Routes;
