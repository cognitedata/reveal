import { HOME_ROUTES, PAGES } from 'pages/constants';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DefaultOverlay } from 'pages/MapOverlay/DefaultOverlay';

export const enum DATA_TYPES {
  PERSON = 'people',
  ROOM = 'rooms',
  EQUIPMENT = 'equipment',
}

export type DataTypes = 'people' | 'rooms' | 'equipment';

export const MapOverlayRouter: React.FC = () => {
  return (
    <Switch>
      <Route path={PAGES.HOME} exact>
        <DefaultOverlay />
      </Route>
      <Route path={HOME_ROUTES.HOME_NAVIGATE_SET_DEST}>
        <DefaultOverlay />
      </Route>
      <Route path={HOME_ROUTES.HOME_NAVIGATE_SET_SRC}>
        <DefaultOverlay />
      </Route>
    </Switch>
  );
};
