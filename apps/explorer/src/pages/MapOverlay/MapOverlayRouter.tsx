import { HOME_ROUTES, PAGES } from 'pages/constants';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DefaultOverlay } from 'pages/MapOverlay/DefaultOverlay';
import { Popup } from 'components/Map/Popup/Popup';
import { useGetMapAndSearchData } from 'hooks/useGetMapAndSearchData';

import { RoutingOverlay } from './RoutingOverlay';
import { HighlightMap } from './HighlightMap';

export const enum DATA_TYPES {
  PERSON = 'people',
  ROOM = 'rooms',
  EQUIPMENT = 'equipment',
}

export const MapOverlayRouter: React.FC = () => {
  const { mapData, searchData, isLoading } = useGetMapAndSearchData();

  if (isLoading) {
    return <>Loading Map Data</>;
  }

  return (
    <Switch>
      <Route path={PAGES.HOME} exact>
        <DefaultOverlay />
        <Popup mapData={mapData || {}} searchData={searchData || {}} />
      </Route>
      <Route path={HOME_ROUTES.HOME_NAVIGATE} exact>
        <RoutingOverlay mapData={mapData || {}} searchData={searchData || {}} />
      </Route>
      <Route path={HOME_ROUTES.HOME_NAVIGATE_ROUTE} exact>
        <HighlightMap />
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
