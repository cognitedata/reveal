import { generatePath, Redirect, Route, Switch } from 'react-router-dom';

import { StorageProvider } from './contexts';
import { Equipment, EquipmentList } from './pages';
import { RoutePath } from './routes';

const defaultEquipmentsUrl = generatePath(RoutePath.EQUIPMENT_LIST, {
  unitName: 'G0040',
});

export const ScarletApp = () => (
  <StorageProvider>
    <Switch>
      <Route path={RoutePath.EQUIPMENT} render={() => <Equipment />} />
      <Route path={RoutePath.EQUIPMENT_LIST} render={() => <EquipmentList />} />
      <Redirect from="" to={defaultEquipmentsUrl} />
    </Switch>
  </StorageProvider>
);
