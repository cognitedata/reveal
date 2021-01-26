import React from 'react';
import { Route } from 'react-router-dom';
import { INTEGRATIONS } from '../utils/baseURL';

const LazyIntegrations = React.lazy(
  () =>
    import(
      '../pages/Integrations/Integrations'
      /* webpackChunkName: "pnid_integrations" */
    )
);
const LazyIntegration = React.lazy(
  () =>
    import(
      '../pages/Integration/IntegrationPage'
      /* webpackChunkName: "pnid_integration" */
    )
);
interface IntegrationsRoute {
  name: string;
  path: string;
  exact: boolean;
  component: React.LazyExoticComponent<React.FunctionComponent>;
}
export type RouterParams = { id: string };
export const routingConfig: IntegrationsRoute[] = [
  {
    name: 'Integrations',
    path: `/:tenant/${INTEGRATIONS}`,
    exact: true,
    component: LazyIntegrations,
  },
  {
    name: 'Integration',
    path: `/:tenant/${INTEGRATIONS}/:id`,
    exact: false,
    component: LazyIntegration,
  },
];
export const routesForBreadCrums = () => {
  return routingConfig.map(({ path, name }) => {
    return { path, name };
  });
};

export const Routes = () => {
  return (
    <>
      {routingConfig.map(({ path, name, component, exact }) => {
        return (
          <Route exact={exact} key={name} path={path} component={component} />
        );
      })}
    </>
  );
};
