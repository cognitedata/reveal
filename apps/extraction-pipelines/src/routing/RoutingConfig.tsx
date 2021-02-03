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

const LazyCreateIntegrationDataSet = React.lazy(
  () =>
    import(
      '../pages/create/DataSetPage'
      /* webpackChunkName: "pnid_integration_create_data_set" */
    )
);

const LazyCreateIntegrationRawTable = React.lazy(
  () =>
    import(
      '../pages/create/RawTablePage'
      /* webpackChunkName: "pnid_integration_create_raw_table" */
    )
);

const LazyCreateIntegrationSchedule = React.lazy(
  () =>
    import(
      '../pages/create/SchedulePage'
      /* webpackChunkName: "pnid_integration_create_schedule" */
    )
);

const LazyCreateIntegrationDataSetId = React.lazy(
  () =>
    import(
      '../pages/create/DataSetIdPage'
      /* webpackChunkName: "pnid_integration_create_data_set_id" */
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

export const SCHEDULE_PAGE_PATH = `/${INTEGRATIONS}/create/schedule`;
export const DATA_SET_PAGE_PATH = `/${INTEGRATIONS}/create/dataset`;
export const DATA_SET_ID_PAGE_PATH = `/${INTEGRATIONS}/create/dataset-id`;
export const CRON_PAGE_PATH = `/${INTEGRATIONS}/create/cron`;
export const RAW_TABLE_PAGE_PATH = `/${INTEGRATIONS}/create/raw-table`;
export const RAW_TABLE_LIST_PAGE_PATH = `/${INTEGRATIONS}/create/raw-table-list`;
export const METADATA_PAGE_PATH = `/${INTEGRATIONS}/create/meta-data`;
export const CREATE_INTEGRATION_PAGE_PATH = `/${INTEGRATIONS}/create`;
export const INTEGRATIONS_OVERVIEW_PAGE_PATH = `/${INTEGRATIONS}`;
const createIntegrationRoutes = [
  {
    name: 'Create integration - create',
    path: `/:tenant${CREATE_INTEGRATION_PAGE_PATH}`,
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
  {
    name: 'Create integration - data set',
    path: `/:tenant${DATA_SET_PAGE_PATH}`,
    exact: true,
    component: LazyCreateIntegrationDataSet,
  },
  {
    name: 'Create integration - Raw Tables',
    path: `/:tenant${RAW_TABLE_PAGE_PATH}`,
    exact: true,
    component: LazyCreateIntegrationRawTable,
  },
  {
    name: 'Create integration - schedule',
    path: `/:tenant/${INTEGRATIONS}/create/schedule`,
    exact: true,
    component: LazyCreateIntegrationSchedule,
  },
  {
    name: 'Create integration - Data set id',
    path: `/:tenant${DATA_SET_ID_PAGE_PATH}`,
    exact: true,
    component: LazyCreateIntegrationDataSetId,
  },
];
export const routingConfig: IntegrationsRoute[] = [
  {
    name: 'Integrations',
    path: `/:tenant${INTEGRATIONS_OVERVIEW_PAGE_PATH}`,
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
