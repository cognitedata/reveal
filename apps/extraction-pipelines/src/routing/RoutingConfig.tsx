import React from 'react';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';

const LazyExtpipes = React.lazy(
  () =>
    import(
      '../pages/Extpipes/Extpipes'
      /* webpackChunkName: "pnid_extpipes" */
    )
);
const LazyExtpipe = React.lazy(
  () =>
    import(
      '../pages/Extpipe/ExtpipePage'
      /* webpackChunkName: "pnid_extpipe" */
    )
);

const LazyCreateExtpipeCreateRoot = React.lazy(
  () =>
    import(
      '../pages/create/Create'
      /* webpackChunkName: "pnid_extpipe_create_create_routes" */
    )
);
interface ExtpipesRoute {
  name: string;
  path: string;
  exact?: boolean;
  component: React.LazyExoticComponent<React.FunctionComponent>;
}
export type RouterParams = { id: string };
export const EXT_PIPE_PATH = `extpipe`;
export const HEALTH_PATH: Readonly<string> = 'health';

export const CREATE_EXT_PIPE_PAGE_PATH = `/${EXTRACTION_PIPELINES_PATH}/create`;
export const EXT_PIPES_OVERVIEW_PAGE_PATH = `/${EXTRACTION_PIPELINES_PATH}`;

export const routingConfig: ExtpipesRoute[] = [
  {
    name: 'Extpipes',
    path: `/:tenant${EXT_PIPES_OVERVIEW_PAGE_PATH}`,
    exact: true,
    component: LazyExtpipes,
  },
  {
    name: 'Create extpipe - create',
    path: `/:tenant${CREATE_EXT_PIPE_PAGE_PATH}`,
    component: LazyCreateExtpipeCreateRoot,
  },
  {
    name: 'Extpipe',
    path: `/:tenant/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/:id`,
    exact: false,
    component: LazyExtpipe,
  },
];
