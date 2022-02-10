/*!
 * Copyright 2022 Cognite AS
 */

function getNumber(arg: string | undefined): number | undefined {
  return typeof arg === 'string' ? parseInt(arg, 10) : arg
}

export const env = {
  project: process.env.REACT_APP_PROJECT || 'publicdata',
  cluster: process.env.REACT_APP_CLUSTER || 'api',
  cad: {
    modelId: getNumber(process.env.REACT_APP_CAD_ID) || 3356984403684032,
    revisionId: getNumber(process.env.REACT_APP_CAD_REVISION_ID) || 6664823881595566,
  },
  pointCloud: {
    modelId: getNumber(process.env.REACT_APP_POINTCLOUD_ID) || 5564365369975452,
    revisionId: getNumber(process.env.REACT_APP_POINTCLOUD_REVISION_ID) || 2817572261344477
  }
}
