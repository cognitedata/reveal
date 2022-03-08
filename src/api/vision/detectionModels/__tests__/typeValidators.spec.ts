import {
  validBoundingBox,
  vertexIsNormalized,
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

  test('To few items in vertices', () => {
    const visionJobAnnotation = {
      region: { shape: RegionShape.Rectangle, vertices: [{}] },
    } as VisionJobAnnotation;
    expect(validBoundingBox(visionJobAnnotation)).toBe(false);
  });

  test('To many items in vertices', () => {
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
