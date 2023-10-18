import { PathData } from './routesMap';

export const root: string = 'interactive-diagrams';
export const staticRoot: string = `/:project/${root}`;

export const paths: { [key: string]: PathData } = {
  landingPage: {
    showOnStepList: false,
    path: () => `/${root}`,
    staticPath: '/',
    title: 'Interactive Engineering Diagrams',
  },
  diagramSelection: {
    showOnStepList: true,
    path: (workflowId?: string | number) => `/${root}/workflow/${workflowId}`,
    staticPath: 'workflow/:workflowId',
    title: 'Select engineering diagrams',
    workflowStepName: 'diagramSelection',
  },
  resourceSelectionFiles: {
    showOnStepList: true,
    path: (workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}/selection/files`,
    staticPath: 'workflow/:workflowId/selection/files',
    title: 'Other engineering diagrams',
    workflowStepName: 'resourceSelectionFiles',
    comboBox: 'Link to...',
  },
  resourceSelectionAssets: {
    showOnStepList: true,
    path: (workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}/selection/assets`,
    staticPath: 'workflow/:workflowId/selection/assets',
    title: 'Assets',
    workflowStepName: 'resourceSelectionAssets',
    comboBox: 'Link to...',
  },
  configPage: {
    showOnStepList: true,
    path: (workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}/config`,
    staticPath: 'workflow/:workflowId/config',
    title: 'Select model',
    workflowStepName: 'config',
    skippable: true,
  },
  reviewPage: {
    showOnStepList: true,
    path: (workflowId?: string | number) =>
      `/${root}/workflow/${workflowId}/review`,
    staticPath: 'workflow/:workflowId/review',
    title: 'Review results',
    workflowStepName: 'review',
  },
  diagramPreview: {
    showOnStepList: false,
    path: (workflowId?: string | number, fileId?: string | number) =>
      `/${root}/workflow/${workflowId}/diagram/${fileId}`,
    staticPath: 'workflow/:workflowId/diagram/:fileId',
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