import { match } from 'path-to-regexp';
// @ts-ignore
import { RegisterApplicationConfig } from 'single-spa-react';

import { matchesAny } from '../utils/utils';
declare const System: any;

type RouteConfig = {
  route: string;
  option?: {
    end: boolean;
  };
};

const matcher = (config: RouteConfig) =>
  match(config.route, { end: config.option?.end || false });

export const platypusUiRoutes = [
  { route: '/:tenantName/data-models-previous' },
].map(matcher);

export const fdmUIRoutes = [
  { route: '/:tenantName/data-models' },
  { route: '/:applicationName/:tenantName/data-models' },
].map(matcher);

export const navigationRoutes = [{ route: '/:tenantName/navigation' }].map(
  matcher
);

export const dataCatalogRoutes = [
  { route: '/:tenantName/new-data-sets' },
  { route: '/:tenantName/data-sets' },
  { route: '/:tenantName/data-catalog' },
  { route: '/:tenantName/data-catalog/data-set/:dataSetId' },
  { route: '/:applicationName/:tenantName/data-catalog' },
  { route: '/:applicationName/:tenantName/data-sets' },
  { route: '/:applicationName/:tenantName/new-data-sets' },
  { route: '/:applicationName/:tenantName/data-catalog/data-set/:dataSetId' },
].map(matcher);

export const accessManagementRoutes = [
  { route: '/:tenantName/access-management' },
  { route: '/:applicationName/:tenantName/access-management' },
].map(matcher);

const applications: RegisterApplicationConfig<any>[] = [
  {
    name: '@cognite/cdf-solutions-ui',
    app: () => System.import('@cognite/cdf-solutions-ui'),
    activeWhen: (location) => {
      return (
        matchesAny(location, platypusUiRoutes) ||
        matchesAny(location, fdmUIRoutes)
      );
    },
  },
  {
    name: '@cognite/cdf-data-catalog',
    app: () => System.import('@cognite/cdf-data-catalog'),
    activeWhen: (location) => {
      return matchesAny(location, dataCatalogRoutes);
    },
  },

  {
    name: '@cognite/cdf-access-management',
    app: () => System.import('@cognite/cdf-access-management'),
    activeWhen: (location) => {
      return matchesAny(location, accessManagementRoutes);
    },
  },
  {
    name: '@cognite/cdf-navigation',
    app: () => System.import('@cognite/cdf-navigation'),
    activeWhen: (location) => {
      return matchesAny(location, navigationRoutes);
    },
  },
];

export default applications;
