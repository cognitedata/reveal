import React from 'react';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';

export const LazyCreateIntegrationCreate = React.lazy(
  () =>
    import(
      '../pages/create/CreateIntegration'
      /* webpackChunkName: "pnid_integration_create" */
    )
);

export const CREATE_INTEGRATION_PAGE_PATH = `/${EXTRACTION_PIPELINES_PATH}/create`;
export const withTenant = (path: string) => {
  return `/:tenant${path}`;
};
export const createIntegrationRoutes = [
  {
    name: 'Create integration - Intro',
    path: withTenant(CREATE_INTEGRATION_PAGE_PATH),
    exact: true,
    component: LazyCreateIntegrationCreate,
  },
];
