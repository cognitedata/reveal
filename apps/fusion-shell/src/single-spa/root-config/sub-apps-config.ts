import { RegisterApplicationConfig } from 'single-spa';

import { isUsingUnifiedSignin } from '@cognite/cdf-utilities';

import { matchesAny } from '../../app/utils/utils';

import {
  consoleRoutes,
  threeDManagementRoutes,
  visionRoutes,
  dataStudioRoutes,
  contextualizationRoutes,
  dataExplorationRoutes,
  collectionsRoutes,
  workflowOrchestrationRoutes,
  functionsRoutes,
  dashboardSessionsRoutes,
  templatesRoutes,
  integrationsRoutes,
  rawExplorerRoutes,
  accessManagementRoutes,
  relationshipsRoutes,
  documentSearchRoutes,
  qualityMonitoringRoutes,
  dataCatalogRoutes,
  oldTransformationsRoutes,
  extractorDownloadsRoutes,
  platypusUiRoutes,
  transformationsRoutes,
  flowsRoutes,
  chartsRoutes,
  simIntRoutes,
  industryCanvasRoutes,
  fdmUIRoutes,
  codingConventionRoutes,
  entityMatchingRoutes,
  dataScienceToolkitMatchingRoutes,
  iotHubRoutes,
} from './app-routes';

const isUnifiedSignin = isUsingUnifiedSignin();
declare const System: any;

const applications: RegisterApplicationConfig<any>[] = [
  {
    name: '@cognite/login-page',
    app: () => System.import('@cognite/login-page'),
    activeWhen: (location) => {
      return location.pathname === '/';
    },
  },
  {
    name: '@cognite/cdf-console',
    app: () => System.import('@cognite/cdf-console'),
    activeWhen: (location) => {
      return matchesAny(location, consoleRoutes);
    },
  },
  {
    // former "glados" console subapp
    name: '@cognite/cdf-3d-management',
    app: () => System.import('@cognite/cdf-3d-management'),
    activeWhen: (location) => {
      return matchesAny(location, threeDManagementRoutes);
    },
  },
  {
    name: '@cognite/cdf-vision-subapp',
    app: () => System.import('@cognite/cdf-vision-subapp'),
    activeWhen: (location) => {
      return matchesAny(location, visionRoutes);
    },
  },
  {
    name: '@cognite/cdf-datastudio',
    app: () => System.import('@cognite/cdf-datastudio'),
    activeWhen: (location) => {
      return matchesAny(location, dataStudioRoutes);
    },
  },
  {
    name: '@cognite/cdf-ui-entity-matching',
    app: () => System.import('@cognite/cdf-ui-entity-matching'),
    activeWhen: (location) => {
      return matchesAny(location, entityMatchingRoutes);
    },
  },
  {
    name: '@cognite/cdf-ui-notebook',
    app: () => System.import('@cognite/cdf-ui-notebook'),
    activeWhen: (location) => {
      return matchesAny(location, dataScienceToolkitMatchingRoutes);
    },
  },
  {
    // subapp extracted from Data Studio
    name: '@cognite/cdf-context-ui-pnid',
    app: () => System.import('@cognite/cdf-context-ui-pnid'),
    activeWhen: (location) => {
      return matchesAny(location, contextualizationRoutes);
    },
  },
  {
    name: '@cognite/cdf-data-exploration',
    app: () => System.import('@cognite/cdf-data-exploration'),
    activeWhen: (location) => {
      return matchesAny(location, dataExplorationRoutes);
    },
  },
  {
    name: '@cognite/cdf-collections',
    app: () => System.import('@cognite/cdf-collections'),
    activeWhen: (location) => {
      return matchesAny(location, collectionsRoutes);
    },
  },
  {
    name: '@cognite/cdf-functions-ui',
    app: () => System.import('@cognite/cdf-functions-ui'),
    activeWhen: (location) => {
      return matchesAny(location, functionsRoutes);
    },
  },
  {
    name: '@cognite/cdf-integrations-ui',
    app: () => System.import('@cognite/cdf-integrations-ui'),
    activeWhen: (location) => {
      return matchesAny(location, integrationsRoutes);
    },
  },
  {
    name: '@cognite/cdf-raw-explorer',
    app: () => System.import('@cognite/cdf-raw-explorer'),
    activeWhen: (location) => {
      return matchesAny(location, rawExplorerRoutes);
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
    name: '@cognite/cdf-ui-dqm',
    app: () => System.import('@cognite/cdf-ui-dqm'),
    activeWhen: (location) => {
      return matchesAny(location, qualityMonitoringRoutes);
    },
  },
  {
    name: '@cognite/cdf-workflow-orchestration',
    app: () => System.import('@cognite/cdf-workflow-orchestration'),
    activeWhen: (location) => {
      return matchesAny(location, workflowOrchestrationRoutes);
    },
  },
  {
    name: '@cognite/cdf-dashboard-sessions-ui',
    app: () => System.import('@cognite/cdf-dashboard-sessions-ui'),
    activeWhen: (location) => {
      return matchesAny(location, dashboardSessionsRoutes);
    },
  },
  {
    name: '@cognite/cdf-templates',
    app: () => System.import('@cognite/cdf-templates'),
    activeWhen: (location) => {
      return matchesAny(location, templatesRoutes);
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
    name: '@cognite/cdf-relationships-ui',
    app: () => System.import('@cognite/cdf-relationships-ui'),
    activeWhen: (location) => {
      return matchesAny(location, relationshipsRoutes);
    },
  },
  {
    name: '@cognite/cdf-document-search-ui',
    app: () => System.import('@cognite/cdf-document-search-ui'),
    activeWhen: (location) => {
      return matchesAny(location, documentSearchRoutes);
    },
  },
  {
    name: '@cognite/cdf-transformations',
    app: () => System.import('@cognite/cdf-transformations'),
    activeWhen: (location) => {
      return matchesAny(location, oldTransformationsRoutes);
    },
  },
  {
    name: '@cognite/cdf-transformations-2',
    app: () => System.import('@cognite/cdf-transformations-2'),
    activeWhen: (location) => {
      return matchesAny(location, transformationsRoutes);
    },
  },
  {
    name: '@cognite/cdf-flows',
    app: () => System.import('@cognite/cdf-flows'),
    activeWhen: (location) => {
      return matchesAny(location, flowsRoutes);
    },
  },
  {
    name: '@cognite/cdf-extractor-downloads',
    app: () => System.import('@cognite/cdf-extractor-downloads'),
    activeWhen: (location) => {
      return matchesAny(location, extractorDownloadsRoutes);
    },
  },
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
    name: '@cognite/cdf-charts-ui',
    app: () => System.import('@cognite/cdf-charts-ui'),
    activeWhen: (location) => {
      return matchesAny(location, chartsRoutes);
    },
  },
  {
    name: '@cognite/cdf-industry-canvas-ui',
    app: () => System.import('@cognite/cdf-industry-canvas-ui'),
    activeWhen: (location) => {
      return matchesAny(location, industryCanvasRoutes);
    },
  },
  {
    name: '@cognite/cdf-simint-ui',
    app: () => System.import('@cognite/cdf-simint-ui'),
    activeWhen: (location) => {
      return matchesAny(location, simIntRoutes);
    },
  },
  {
    name: '@cognite/cdf-coding-conventions',
    app: () => System.import('@cognite/cdf-coding-conventions'),
    activeWhen: (location) => {
      return matchesAny(location, codingConventionRoutes);
    },
  },
  {
    name: '@cognite/cdf-iot-hub',
    app: () => System.import('@cognite/cdf-iot-hub'),
    activeWhen: (location) => {
      return matchesAny(location, iotHubRoutes);
    },
  },
];

export default applications;
