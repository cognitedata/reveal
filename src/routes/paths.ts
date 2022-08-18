import { PathData } from './routesMap';

export const root: string = 'interactive-diagrams';
export const staticRoot: string = `/:tenant/${root}`;

export const paths: { [key: string]: PathData } = {
  landingPage: {
    showOnStepList: false,
    path: (_tenant: string) => `/${root}`,
    staticPath: staticRoot,
    title: 'Interactive Engineering Diagrams',
  },
  diagramSelection: {
    showOnStepList: true,
    path: (_tenant: string, workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}`,
    staticPath: `${staticRoot}/workflow/:workflowId`,
    title: 'Select engineering diagrams',
    workflowStepName: 'diagramSelection',
  },
  resourceSelectionFiles: {
    showOnStepList: true,
    path: (_tenant: string, workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}/selection/files`,
    staticPath: `${staticRoot}/workflow/:workflowId/selection/files`,
    title: 'Other engineering diagrams',
    workflowStepName: 'resourceSelectionFiles',
    comboBox: 'Link to...',
  },
  resourceSelectionAssets: {
    showOnStepList: true,
    path: (_tenant: string, workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}/selection/assets`,
    staticPath: `${staticRoot}/workflow/:workflowId/selection/assets`,
    title: 'Assets',
    workflowStepName: 'resourceSelectionAssets',
    comboBox: 'Link to...',
  },
  configPage: {
    showOnStepList: true,
    path: (_tenant: string, workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}/config`,
    staticPath: `${staticRoot}/workflow/:workflowId/config`,
    title: 'Select model',
    workflowStepName: 'config',
    skippable: true,
  },
  reviewPage: {
    showOnStepList: true,
    path: (_tenant: string, workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}/review`,
    staticPath: `${staticRoot}/workflow/:workflowId/review`,
    title: 'Review results',
    workflowStepName: 'review',
  },
  diagramPreview: {
    showOnStepList: false,
    path: (
      _tenant: string,
      workflowId?: string | number,
      fileId?: string | number
    ) => `/${root}/workflow/${workflowId}/diagram/${fileId}`,
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
