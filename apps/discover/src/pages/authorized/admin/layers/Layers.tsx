import * as React from 'react';
import {
  Route,
  Redirect,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom';

import { SegmentedControl } from '@cognite/cogs.js';

import navigation from 'constants/navigation';
import { NavigationTab } from 'pages/types';

import { TabBar } from '../feedback/elements';

import { LayersCreate } from './LayersCreate';
import { LayersList } from './LayersList';

enum Tabs {
  'create',
  'list',
}

const navigationTabItems: NavigationTab[] = [
  {
    key: `${Tabs.create}`,
    name: 'Layer create',
    path: navigation.ADMIN_LAYERS_CREATE,
  },
  {
    key: `${Tabs.list}`,
    name: 'Layers list',
    path: navigation.ADMIN_LAYERS_LIST,
  },
];

export const AdminLayers: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const selectedItem = React.useMemo(
    () => navigationTabItems.find((y) => y.path === location.pathname)?.key,
    [location.pathname]
  );

  const handleNavigation = (tabKey: string) => {
    const tabItem = navigationTabItems.find((item) => item.key === tabKey);
    if (tabItem) history.push(tabItem.path);
  };

  return (
    <>
      <TabBar>
        <div>
          <SegmentedControl
            currentKey={selectedItem}
            onButtonClicked={handleNavigation}
          >
            <SegmentedControl.Button key={Tabs.create}>
              Create new Layer
            </SegmentedControl.Button>
            <SegmentedControl.Button key={Tabs.list}>
              List layers
            </SegmentedControl.Button>
          </SegmentedControl>
        </div>
      </TabBar>
      <Switch>
        <Route
          path={navigation.ADMIN_LAYERS_CREATE}
          render={() => <LayersCreate />}
        />
        <Route
          path={navigation.ADMIN_LAYERS_LIST}
          render={() => <LayersList />}
        />
        <Redirect
          from={navigation.ADMIN_LAYERS}
          to={navigation.ADMIN_LAYERS_LIST}
        />
      </Switch>
    </>
  );
};
