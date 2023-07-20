import { match } from 'path-to-regexp';

type RouteConfig = {
  route: string;
  option?: {
    end: boolean;
  };
};

const matcher = (config: RouteConfig) =>
  match(config.route, { end: config.option?.end || false });

export const consoleRoutes = [
  { route: '/:tenantName/infield' },
  { route: '/:applicationName/:tenantName/infield' },
].map(matcher);

export const qualityMonitoringRoutes = [
  { route: '/:tenantName/quality-monitoring' },
  { route: '/:tenantName/dqm' },
  { route: '/:applicationName/:tenantName/quality-monitoring' },
  { route: '/:applicationName/:tenantName/dqm' },
].map(matcher);

export const threeDManagementRoutes = [
  { route: '/:tenantName/3d-models' },
  { route: '/:applicationName/:tenantName/3d-models' },
].map(matcher);

export const visionRoutes = [
  { route: '/:tenantName/vision' },
  { route: '/:applicationName/:tenantName/vision' },
].map(matcher);

export const dataStudioRoutes = [
  { route: '/:tenantName/entity-matching' },
  { route: '/:applicationName/:tenantName/entity-matching' },
].map(matcher);

export const entityMatchingRoutes = [
  { route: '/:tenantName/entity-matching-new' },
  { route: '/:applicationName/:tenantName/entity-matching-new' },
].map(matcher);

export const dataScienceToolkitMatchingRoutes = [
  { route: '/:tenantName/notebook' },
  { route: '/:tenantName/streamlit-apps' },
  { route: '/:applicationName/:tenantName/notebook' },
  { route: '/:applicationName/:tenantName/streamlit-apps' },
].map(matcher);

export const contextualizationRoutes = [
  { route: '/:tenantName/interactive-diagrams' },
  { route: '/:applicationName/:tenantName/interactive-diagrams' },
].map(matcher);

export const dataExplorationRoutes = [
  { route: '/:tenantName/explore' },
  { route: '/:applicationName/:tenantName/explore' },
].map(matcher);

export const collectionsRoutes = [
  { route: '/:tenantName/collections' },
  { route: '/:applicationName/:tenantName/collections' },
].map(matcher);

export const functionsRoutes = [
  { route: '/:tenantName/functions' },
  { route: '/:applicationName/:tenantName/functions' },
].map(matcher);

export const simIntRoutes = [
  { route: '/:tenantName/simint' },
  { route: '/:applicationName/:tenantName/simint' },
].map(matcher);

export const industryCanvasRoutes = [
  { route: '/:tenantName/industrial-canvas' },
  { route: '/:applicationName/:tenantName/industrial-canvas' },
].map(matcher);

export const workflowOrchestrationRoutes = [
  { route: '/:tenantName/workflows' },
  { route: '/:applicationName/:tenantName/workflows' },
].map(matcher);

export const dashboardSessionsRoutes = [
  { route: '/:tenantName/dashboard-sessions' },
  { route: '/:applicationName/:tenantName/dashboard-sessions' },
].map(matcher);

export const templatesRoutes = [
  { route: '/:tenantName/template-management' },
  { route: '/:applicationName/:tenantName/template-management' },
].map(matcher);

export const accessManagementRoutes = [
  { route: '/:tenantName/access-management' },
  { route: '/:applicationName/:tenantName/access-management' },
].map(matcher);

export const integrationsRoutes = [
  { route: '/:tenantName/extpipes' },
  { route: '/:applicationName/:tenantName/extpipes' },
].map(matcher);

export const rawExplorerRoutes = [
  { route: '/:tenantName/raw-explorer' },
  { route: '/:tenantName/raw' },
  { route: '/:applicationName/:tenantName/raw' },
  { route: '/:applicationName/:tenantName/raw-explorer' },
].map(matcher);

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

export const relationshipsRoutes = [
  {
    route: '/:tenantName/relationships',
  },
  { route: '/:applicationName/:tenantName/relationships' },
].map(matcher);

export const documentSearchRoutes = [
  { route: '/:tenantName/documents' },
  { route: '/:applicationName/:tenantName/documents' },
].map(matcher);

export const oldTransformationsRoutes = [
  { route: '/:tenantName/transformations-previous' },
  { route: '/:applicationName/:tenantName/transformations-previous' },
].map(matcher);

export const transformationsRoutes = [
  { route: '/:tenantName/transformations' },
  { route: '/:applicationName/:tenantName/transformations' },
].map(matcher);

export const flowsRoutes = [
  { route: '/:tenantName/flows' },
  { route: '/:applicationName/:tenantName/flows' },
].map(matcher);

export const extractorDownloadsRoutes = [
  { route: '/:tenantName/extractors' },
  { route: '/:applicationName/:tenantName/extractors' },
].map(matcher);

export const platypusUiRoutes = [
  { route: '/:tenantName/data-models-previous' },
  { route: '/:applicationName/:tenantName/data-models-previous' },
].map(matcher);

export const fdmUIRoutes = [
  { route: '/:tenantName/data-models' },
  { route: '/:applicationName/:tenantName/data-models' },
].map(matcher);

export const chartsRoutes = [
  { route: '/:tenantName/charts' },
  { route: '/:applicationName/:tenantName/charts' },
].map(matcher);

export const codingConventionRoutes = [
  { route: '/:tenantName/coding-conventions' },
  { route: '/:applicationName/:tenantName/coding-conventions' },
].map(matcher);

export const iotHubRoutes = [
  { route: '/:tenantName/iot' },
  { route: '/:applicationName/:tenantName/iot' },
].map(matcher);
