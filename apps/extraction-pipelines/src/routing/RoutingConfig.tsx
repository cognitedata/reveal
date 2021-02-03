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
const LazyCreateIntegrationCreate = React.lazy(
  () =>
    import(
      '../pages/create/CreateIntegration'
      /* webpackChunkName: "pnid_integration_create" */
    )
);
const LazyCreateIntegrationName = React.lazy(
  () =>
    import(
      '../pages/create/NamePage'
      /* webpackChunkName: "pnid_integration_create_name" */
    )
);
const LazyCreateIntegrationExternalId = React.lazy(
  () =>
    import(
      '../pages/create/ExternalIdPage'
      /* webpackChunkName: "pnid_integration_create_external_id" */
    )
);
const LazyCreateIntegrationDescription = React.lazy(
  () =>
    import(
      '../pages/create/DescriptionPage'
      /* webpackChunkName: "pnid_integration_create_description" */
    )
);
const LazyCreateIntegrationContacts = React.lazy(
  () =>
    import(
      '../pages/create/ContactsPage'
      /* webpackChunkName: "pnid_integration_create_contacts" */
    )
);

interface IntegrationsRoute {
  name: string;
  path: string;
  exact: boolean;
  component: React.LazyExoticComponent<React.FunctionComponent>;
}
export type RouterParams = { id: string };
export const INTEGRATION = `integration`;
const createIntegrationRoutes = [
  {
    name: 'Create integration - create',
    path: `/:tenant/${INTEGRATIONS}/create`,
    exact: true,
    component: LazyCreateIntegrationCreate,
  },
  {
    name: 'Create integration - name',
    path: `/:tenant/${INTEGRATIONS}/create/integration-name`,
    exact: true,
    component: LazyCreateIntegrationName,
  },
  {
    name: 'Create integration - external id',
    path: `/:tenant/${INTEGRATIONS}/create/integration-external-id`,
    exact: true,
    component: LazyCreateIntegrationExternalId,
  },
  {
    name: 'Create integration - description',
    path: `/:tenant/${INTEGRATIONS}/create/integration-description`,
    exact: true,
    component: LazyCreateIntegrationDescription,
  },
  {
    name: 'Create integration - contacts',
    path: `/:tenant/${INTEGRATIONS}/create/integration-contacts`,
    exact: true,
    component: LazyCreateIntegrationContacts,
  },
];
export const routingConfig: IntegrationsRoute[] = [
  {
    name: 'Integrations',
    path: `/:tenant/${INTEGRATIONS}`,
    exact: true,
    component: LazyIntegrations,
  },
  ...createIntegrationRoutes,
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
