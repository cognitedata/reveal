import { Route, Redirect, Switch } from 'react-router-dom';

import navigation from 'constants/navigation';

import { useTabs } from './useTabs';

export const InspectRouter = () => {
  const tabs = useTabs();
  return (
    <Switch>
      {tabs.map((tab) => (
        <Route key={tab.key} path={tab.path} render={tab.componentToRender} />
      ))}

      <Redirect
        from={navigation.SEARCH_WELLS_INSPECT}
        to={navigation.SEARCH_WELLS_INSPECT_OVERVIEW}
      />
    </Switch>
  );
};

export default InspectRouter;
