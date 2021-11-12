import React from 'react';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';

export const LazyCreateExtpipeCreate = React.lazy(
  () =>
    import(
      'pages/create/CreateExtpipe'
      /* webpackChunkName: "pnid_extpipe_create" */
    )
);

export const CREATE_EXTPIPE_PAGE_PATH = `/${EXTRACTION_PIPELINES_PATH}/create`;
export const withTenant = (path: string) => {
  return `/:tenant${path}`;
};
export const createExtpipeRoutes = [
  {
    name: 'Create extpipe - Intro',
    path: withTenant(CREATE_EXTPIPE_PAGE_PATH),
    exact: true,
    component: LazyCreateExtpipeCreate,
  },
];
