import { PathData } from './routesMap';

export const staticRoot: string = '/:tenant/pnid_parsing_new';
export const root: string = 'pnid_parsing_new';

export const paths: { [key: string]: PathData } = {
  landingPage: {
    isNotStep: true,
    path: (tenant: string) => `/${tenant}/${root}`,
    staticPath: staticRoot,
    title: 'Engineering Diagrams Contextualization',
  },
  diagramSelection: {
    path: (tenant: string, workflowId: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}`,
    staticPath: `${staticRoot}/workflow/:workflowId`,
    title: 'Select engineering diagrams',
    workflowStepName: 'diagramSelection',
  },
  resourceSelection: {
    path: (tenant: string, workflowId: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}/selection`,
    staticPath: `${staticRoot}/workflow/:workflowId/selection`,
    title: 'Select resources',
    workflowStepName: 'resourceSelection',
  },
  configPage: {
    path: (tenant: string, workflowId: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}/config`,
    staticPath: `${staticRoot}/workflow/:workflowId/config`,
    title: 'P&ID configuration',
    workflowStepName: 'config',
  },
  reviewPage: {
    path: (tenant: string, workflowId: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}/review`,
    staticPath: `${staticRoot}/workflow/:workflowId/review`,
    title: 'Review results',
    workflowStepName: 'review',
  },
  diagramPreview: {
    path: (
      tenant: string,
      workflowId: string | number,
      fileId?: string | number
    ) => `/${tenant}/${root}/workflow/${workflowId}/diagram/${fileId}`,
    staticPath: `${staticRoot}/workflow/:workflowId/diagram/:fileId`,
    title: 'Review a file',
    workflowStepName: 'diagramPreview',
  },
};

export const {
  landingPage,
  diagramSelection,
  resourceSelection,
  configPage,
  reviewPage,
  diagramPreview,
} = paths;
