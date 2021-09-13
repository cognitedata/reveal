export const cadTestBasePath = '/test/cad/'
export const pointcloudTestBasePath = '/test/pointcloud/'

export enum TestCaseCad {
  default = 'default',
  clipping = 'clipping',
  defaultCamera = 'defaultCamera',
  highlight = 'highlight',
  rotateCadModel = 'rotateCadModel',
  scaledModel = 'scaledModel',
  userRenderTarget = 'userRenderTarget',
  ssao = 'ssao',
  customObjectWithHighlightAndGhosted = 'customObjectWithHighlightAndGhosted',
  defaultCognite3DViewer = 'default-cognite3dviewer'
}

export enum TestCasePointCloud {
  default = 'default'
}
