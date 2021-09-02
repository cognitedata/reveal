import { PathData } from './routesMap';

export const staticRoot: string = '/:tenant/pnid_parsing_new';
export const root: string = 'pnid_parsing_new';

export const paths: { [key: string]: PathData } = {
  landingPage: {
    showOnStepList: false,
    path: (tenant: string) => `/${tenant}/${root}`,
    staticPath: staticRoot,
    title: 'Interactive Engineering Diagrams',
  },
  diagramSelection: {
    showOnStepList: true,
    path: (tenant: string, workflowId?: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}`,
    staticPath: `${staticRoot}/workflow/:workflowId`,
    title: 'Select engineering diagrams',
    workflowStepName: 'diagramSelection',
  },
  resourceSelectionAssets: {
    showOnStepList: true,
    path: (tenant: string, workflowId?: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}/selection/assets`,
    staticPath: `${staticRoot}/workflow/:workflowId/selection/assets`,
    title: 'Select resources (assets)',
    workflowStepName: 'resourceSelectionAssets',
  },
  resourceSelectionFiles: {
    showOnStepList: true,
    path: (tenant: string, workflowId?: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}/selection/files`,
    staticPath: `${staticRoot}/workflow/:workflowId/selection/files`,
    title: 'Select resources (files)',
    workflowStepName: 'resourceSelectionFiles',
  },
  configPage: {
    showOnStepList: true,
    path: (tenant: string, workflowId?: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}/config`,
    staticPath: `${staticRoot}/workflow/:workflowId/config`,
    title: 'Select model',
    workflowStepName: 'config',
    skippable: true,
  },
  reviewPage: {
    showOnStepList: true,
    path: (tenant: string, workflowId?: string | number) =>
      `/${tenant}/${root}/workflow/${workflowId}/review`,
    staticPath: `${staticRoot}/workflow/:workflowId/review`,
    title: 'Review results',
    workflowStepName: 'review',
  },
  diagramPreview: {
    showOnStepList: false,
    path: (
      tenant: string,
      workflowId?: string | number,
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
  resourceSelectionAssets,
  resourceSelectionFiles,
  configPage,
  reviewPage,
  diagramPreview,
} = paths;
