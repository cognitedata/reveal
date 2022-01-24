import { generatePath, Redirect, Route, Switch } from 'react-router-dom';

import { AppProvider } from './contexts';
import { Equipment, EquipmentList } from './pages';
import { RoutePath } from './routes';

const defaultEquipmentsUrl = generatePath(RoutePath.EQUIPMENT_LIST, {
  unitName: 'G0040',
});

export const ScarletApp = () => (
  <AppProvider>
    <Switch>
      <Route path={RoutePath.EQUIPMENT} render={() => <Equipment />} />
      <Route path={RoutePath.EQUIPMENT_LIST} render={() => <EquipmentList />} />
      <Redirect from="" to={defaultEquipmentsUrl} />
    </Switch>
  </AppProvider>
);
