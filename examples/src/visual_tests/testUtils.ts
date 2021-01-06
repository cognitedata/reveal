export const cadTestBasePath = '/test/cad/'
export const pointcloudTestBasePath = '/test/pointcloud/'

export enum TestCaseCad {
  default = 'default',
  clipping = 'clipping',
  defaultCamera = 'defaultCamera',
  highlight = 'highlight',
  rotateCadModel = 'rotateCadModel',
  nodeTransform = 'nodeTransform',
  ghostMode = 'ghostMode',
  scaledModel = 'scaledModel',
  userRenderTarget = 'userRenderTarget',
}

export enum TestCasePointCloud {
  default = 'default'
}
