export const staticRoot: string = '/:tenant/pnid_parsing_new';
export const root: string = 'pnid_parsing_new';

export const landingPage = {
  staticPath: (match: string) => `${match}`,
  path: (tenant: string) => `/${tenant}/${root}`,
};

export const diagramSelection = {
  staticPath: (match: string) => `${match}/workflow/:workflowId`,
  path: (tenant: string, workflowId: string | number) =>
    `/${tenant}/${root}/workflow/${workflowId}`,
};

export const resourceSelection = {
  staticPath: (match: string) => `${match}/workflow/:workflowId/selection`,
  path: (tenant: string, workflowId: string | number) =>
    `/${tenant}/${root}/workflow/${workflowId}/selection`,
};

export const configPage = {
  staticPath: (match: string) => `${match}/workflow/:workflowId/config`,
  path: (tenant: string, workflowId: string | number) =>
    `/${tenant}/${root}/workflow/${workflowId}/config`,
};

export const reviewPage = {
  staticPath: (match: string) => `${match}/workflow/:workflowId/review`,
  path: (tenant: string, workflowId: string | number) =>
    `/${tenant}/${root}/workflow/${workflowId}/review`,
};

export const diagramPreview = {
  staticPath: (match: string) =>
    `${match}/workflow/:workflowId/diagram/:fileId`,
  path: (
    tenant: string,
    workflowId: string | number,
    fileId: string | number
  ) => `/${tenant}/${root}/workflow/${workflowId}/diagram/${fileId}`,
};
