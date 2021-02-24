import React from 'react';
import { Route, Switch, Redirect, useLocation } from 'react-router';
import Breadcrumbs, { BreadcrumbRouteMap } from 'components/Breadcrumbs';

type RouteDef = {
  exact?: boolean;
  strict?: boolean;
  path: string;
  component: any;
  breadcrumbs?: (_: string) => BreadcrumbRouteMap;
};

export default function SwitchWithBreadcrumbs(props: { routes: RouteDef[] }) {
  const { pathname, search, hash } = useLocation();
  const routesMap: BreadcrumbRouteMap = props.routes.reduce((accl, route) => {
    if (route.breadcrumbs) {
      const map = route.breadcrumbs(route.path);
      return {
        ...accl,
        ...map,
      };
    }
    return accl;
  }, {} as BreadcrumbRouteMap);

  return (
    <>
      <Breadcrumbs routesMap={routesMap} />
      <Switch>
        <Redirect
          from="/:url*(/+)"
          to={{
            pathname: pathname.slice(0, -1),
            search,
            hash,
          }}
        />
        {props.routes.map((route) => (
          <Route
            key={route.path}
            exact={!!route.exact}
            strict={!!route.strict}
            path={route.path}
            component={route.component}
          />
        ))}
      </Switch>
    </>
  );
}
