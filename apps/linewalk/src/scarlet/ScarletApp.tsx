import { generatePath, Redirect, Route, Switch } from 'react-router-dom';

import { defaultFacility } from './config';
import { AppProvider } from './contexts';
import { Equipment, EquipmentList } from './pages';
import { RoutePath } from './routes';

const defaultFacilityUrl = generatePath(RoutePath.FACILITY, {
  facility: defaultFacility.path,
});

export const ScarletApp = () => (
  <AppProvider>
    <Switch>
      <Route path={RoutePath.EQUIPMENT} render={() => <Equipment />} />
      <Route path={RoutePath.EQUIPMENT_LIST} render={() => <EquipmentList />} />
      <Route path={RoutePath.FACILITY} render={() => <EquipmentList />} />
      <Redirect from="" to={defaultFacilityUrl} />
    </Switch>
  </AppProvider>
);
