export type VisualTest = {
  testKey: string,
  category: 'cad' | 'pointcloud',
  snapshotBlur?: number,
}

// TODO 2021-09-15 larsmoa: Figure out how we can do create this automatically
// I failed to implement one registry of tests, because we need all logic to work
// both in the server hosting the HTTP server used for visual tests and the
// Jest/Puppeteer test runner.

export const visualTests: VisualTest[] = [
  {
    testKey: 'clipping',
    category: 'cad'
  },
  {
    testKey: 'customObjectWithHighlightAndGhosted',
    category: 'cad'
  },
  {
    testKey: 'customObjectWithHighlightAndGhostedV8',
    category: 'cad'
  },
  {
    testKey: 'customObjectBlending',
    category: 'cad'
  },
  {
    testKey: 'default',
    category: 'cad'
  },
  {
    testKey: 'default-v8',
    category: 'cad'
  },
  {
    testKey: 'defaultCamera',
    category: 'cad'
  },
  {
    testKey: 'default-cognite3dviewer',
    category: 'cad'
  },
  {
    testKey: 'default-cognite3dviewer-pointcloud',
    category: 'pointcloud'
  },
  {
    testKey: 'clipping-planes-cognite3dviewer-pointcloud',
    category: 'pointcloud'
  },
  {
    testKey: 'default-cognite3dviewer-v8',
    category: 'cad'
  },
  {
    testKey: 'default-highlight',
    category: 'cad'
  },
  {
    testKey: 'rotateCadModel',
    category: 'cad'
  },
  {
    testKey: 'scaledModel',
    category: 'cad'
  },
  {
    testKey: 'ssao',
    category: 'cad'
  },
  {
    testKey: 'userRenderTarget',
    category: 'cad'
  },
  {
    testKey: 'two-models-one-ghosted',
    category: 'cad'
  },
  {
    testKey: 'reassign-node-style',
    category: 'cad'
  },
  {
    testKey: 'outlines',
    category: 'cad'
  },
  {
    testKey: 'highlight-with-default-ghosting',
    category: 'cad'
  }
];
