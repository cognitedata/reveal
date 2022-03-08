import {
  validBoundingBox,
  validImageAssetLink,
  vertexIsNormalized,
  uniqueVertices,
} from 'src/api/vision/detectionModels/typeValidators';
import {
  Vertex,
  VisionJobAnnotation,
} from 'src/api/vision/detectionModels/types';
import { RegionShape } from 'src/api/annotation/types';

describe('vertexIsNormalized', () => {
  test('Invalid vertex', () => {
    const vertex = {} as Vertex;
    expect(vertexIsNormalized(vertex)).toBe(false);
  });

  test('Partially invalid vertex', () => {
    const vertex = { x: 1 } as Vertex;
    expect(vertexIsNormalized(vertex)).toBe(false);
  });

  test('Non-normalized vertex', () => {
    const vertex = { x: 1, y: 2 } as Vertex;
    expect(vertexIsNormalized(vertex)).toBe(false);
  });

  test('Valid vertex', () => {
    const vertex = { x: 1, y: 0 } as Vertex;
    expect(vertexIsNormalized(vertex)).toBe(true);
  });
});

describe('verticesAreUnique', () => {
  test('Return true when empty input', () => {
    const vertices = [{}] as Vertex[];
    expect(uniqueVertices(vertices)).toBe(true);
  });

  test('Return true when single item in list', () => {
    const vertices = [{ x: 1, y: 2 }] as Vertex[];
    expect(uniqueVertices(vertices)).toBe(true);
  });

  test('Return true when unqiue items', () => {
    const vertices = [
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 3, y: 2 },
    ] as Vertex[];
    expect(uniqueVertices(vertices)).toBe(true);
  });

  test('Return false when not unqiue items', () => {
    const vertices = [
      { x: 1, y: 2 },
      { x: 1, y: 2 },
    ] as Vertex[];
    expect(uniqueVertices(vertices)).toBe(false);
  });
});

describe('validBoundingBox', () => {
  test('Missing region', () => {
    const visionJobAnnotation = {} as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('Missing shape', () => {
    const visionJobAnnotation = { region: {} } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('Invalid shape', () => {
    const visionJobAnnotation = {
      region: { shape: RegionShape.Polygon },
    } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('Missing vertices', () => {
    const visionJobAnnotation = {
      region: { shape: RegionShape.Rectangle },
    } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('Too few items in vertices', () => {
    const visionJobAnnotation = {
      region: { shape: RegionShape.Rectangle, vertices: [{}] },
    } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('Too many items in vertices', () => {
    const visionJobAnnotation = {
      region: { shape: RegionShape.Rectangle, vertices: [{}, {}, {}] },
    } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('Invalid vertex', () => {
    const visionJobAnnotation = {
      region: {
        shape: RegionShape.Rectangle,
        vertices: [{ x: 1 }, { x: 1, y: 2 }],
      },
    } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('Non-normalized vertices', () => {
    const visionJobAnnotation = {
      region: {
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 2 },
        ],
      },
    } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('Valid bounding box', () => {
    const visionJobAnnotation = {
      region: {
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      },
    } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(true);
  });
});

describe('validImageAssetLink', () => {
  const boundingBox = {
    region: {
      shape: RegionShape.Rectangle,
      vertices: [
        { x: 0, y: 0.1 },
        { x: 1, y: 0.3 },
      ],
    },
  };
  test('Invalid BoundingBox', () => {
    const visionJobAnnotation = { assetIds: [1] } as VisionJobAnnotation;
    expect(validImageAssetLink(visionJobAnnotation)).toBe(false);
  });

  test('Missing assetIds', () => {
    const visionJobAnnotation = { ...boundingBox } as VisionJobAnnotation;
    expect(validImageAssetLink(visionJobAnnotation)).toBe(false);
  });

  test('Empty assetIds', () => {
    const visionJobAnnotation = {
      ...boundingBox,
      assetIds: [] as number[],
    } as VisionJobAnnotation;
    expect(validImageAssetLink(visionJobAnnotation)).toBe(false);
  });

  test('Invalid asset id (undefined) in assetIds', () => {
    const visionJobAnnotation = {
      ...boundingBox,
      assetIds: [1, 2, undefined],
    } as VisionJobAnnotation;
    expect(validImageAssetLink(visionJobAnnotation)).toBe(false);
  });

  test('Invalid asset id (null) in assetIds', () => {
    const visionJobAnnotation = {
      ...boundingBox,
      assetIds: [1, 2, null],
    } as VisionJobAnnotation;
    expect(validImageAssetLink(visionJobAnnotation)).toBe(false);
  });

  test('Invalid asset id (Nan) in assetIds', () => {
    const visionJobAnnotation = {
      ...boundingBox,
      assetIds: [1, 2, NaN],
    } as VisionJobAnnotation;
    expect(validImageAssetLink(visionJobAnnotation)).toBe(false);
  });

  test('Invalid asset id (Infinity) in assetIds', () => {
    const visionJobAnnotation = {
      ...boundingBox,
      assetIds: [1, 2, Infinity],
    } as VisionJobAnnotation;
    expect(validImageAssetLink(visionJobAnnotation)).toBe(false);
  });

  test('valid imageAssetLink', () => {
    const visionJobAnnotation = {
      ...boundingBox,
      assetIds: [1, 2, 3],
    } as VisionJobAnnotation;
    expect(validImageAssetLink(visionJobAnnotation)).toBe(true);
  });
});
