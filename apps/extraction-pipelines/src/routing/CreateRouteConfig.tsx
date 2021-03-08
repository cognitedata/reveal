import React from 'react';
import { INTEGRATIONS } from '../utils/baseURL';

export const LazyCreateIntegrationCreate = React.lazy(
  () =>
    import(
      '../pages/create/CreateIntegration'
      /* webpackChunkName: "pnid_integration_create" */
    )
);
export const LazyCreateIntegrationName = React.lazy(
  () =>
    import(
      '../pages/create/NamePage'
      /* webpackChunkName: "pnid_integration_create_name" */
    )
);
export const LazyCreateIntegrationExternalId = React.lazy(
  () =>
    import(
      '../pages/create/ExternalIdPage'
      /* webpackChunkName: "pnid_integration_create_external_id" */
    )
);
export const LazyCreateIntegrationDocumentation = React.lazy(
  () =>
    import(
      '../pages/create/DocumentationPage'
      /* webpackChunkName: "pnid_integration_create_documentation" */
    )
);
export const LazyCreateIntegrationContacts = React.lazy(
  () =>
    import(
      '../pages/create/ContactsPage'
      /* webpackChunkName: "pnid_integration_create_contacts" */
    )
);

export const LazyCreateIntegrationDataSet = React.lazy(
  () =>
    import(
      '../pages/create/DataSetPage'
      /* webpackChunkName: "pnid_integration_create_data_set" */
    )
);

export const LazyCreateIntegrationRawTable = React.lazy(
  () =>
    import(
      '../pages/create/RawTablePage'
      /* webpackChunkName: "pnid_integration_create_raw_table" */
    )
);

export const LazyCreateIntegrationSchedule = React.lazy(
  () =>
    import(
      '../pages/create/SchedulePage'
      /* webpackChunkName: "pnid_integration_create_schedule" */
    )
);

export const NAME_PATH = `name`;
export const NAME_PAGE_PATH = `/${INTEGRATIONS}/create/${NAME_PATH}`;
export const EXTERNAL_ID = `external-id`;
export const EXTERNAL_ID_PAGE_PATH = `/${INTEGRATIONS}/create/${EXTERNAL_ID}`;
export const DOCUMENTATION = `documentation`;
export const DOCUMENTATION_PAGE_PATH = `/${INTEGRATIONS}/create/${DOCUMENTATION}`;
const CONTACTS = `contacts`;
export const CONTACTS_PAGE_PATH = `/${INTEGRATIONS}/create/${CONTACTS}`;
const SCHEDULE = `schedule`;
export const SCHEDULE_PAGE_PATH = `/${INTEGRATIONS}/create/${SCHEDULE}`;
const DATA_SET = `dataset`;
export const DATA_SET_PAGE_PATH = `/${INTEGRATIONS}/create/${DATA_SET}`;
const RAW_TABLES = `raw-table`;
export const RAW_TABLE_PAGE_PATH = `/${INTEGRATIONS}/create/${RAW_TABLES}`;
const META_DATA = `meta-data`;
export const METADATA_PAGE_PATH = `/${INTEGRATIONS}/create/${META_DATA}`;
export const CREATE_INTEGRATION_PAGE_PATH = `/${INTEGRATIONS}/create`;

export const createIntegrationRoutes = [
  {
    name: 'Create integration - Intro',
    path: `/:tenant${CREATE_INTEGRATION_PAGE_PATH}`,
    exact: true,
    component: LazyCreateIntegrationCreate,
  },
  {
    name: 'Create integration - name',
    path: `/:tenant${NAME_PAGE_PATH}`,
    component: LazyCreateIntegrationName,
  },
  {
    name: 'Create integration - external id',
    path: `/:tenant${EXTERNAL_ID_PAGE_PATH}`,
    component: LazyCreateIntegrationExternalId,
  },
  {
    name: 'Create integration - documentation',
    path: `/:tenant${DOCUMENTATION_PAGE_PATH}`,
    exact: true,
    component: LazyCreateIntegrationDocumentation,
  },
  {
    name: 'Create integration - contacts',
    path: `/:tenant${CONTACTS_PAGE_PATH}`,
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
    path: `/:tenant${SCHEDULE_PAGE_PATH}`,
    exact: true,
    component: LazyCreateIntegrationSchedule,
  },
];
