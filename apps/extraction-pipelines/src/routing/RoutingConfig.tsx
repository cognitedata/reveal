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

const LazyCreateIntegrationCreateRoot = React.lazy(
  () =>
    import(
      '../pages/create/Create'
      /* webpackChunkName: "pnid_integration_create_create_routes" */
    )
);

interface IntegrationsRoute {
  name: string;
  path: string;
  exact?: boolean;
  component: React.LazyExoticComponent<React.FunctionComponent>;
}
export type RouterParams = { id: string };
export const INTEGRATION = `integration`;

export const CREATE_INTEGRATION_PAGE_PATH = `/${INTEGRATIONS}/create`;
export const INTEGRATIONS_OVERVIEW_PAGE_PATH = `/${INTEGRATIONS}`;

export const routingConfig: IntegrationsRoute[] = [
  {
    name: 'Integrations',
    path: `/:tenant${INTEGRATIONS_OVERVIEW_PAGE_PATH}`,
    exact: true,
    component: LazyIntegrations,
  },
  {
    name: 'Create integration - create',
    path: `/:tenant${CREATE_INTEGRATION_PAGE_PATH}`,
    component: LazyCreateIntegrationCreateRoot,
  },
  {
    name: 'Integration',
    path: `/:tenant/${INTEGRATIONS}/${INTEGRATION}/:id`,
    exact: true,
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
