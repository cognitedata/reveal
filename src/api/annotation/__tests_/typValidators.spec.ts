import { CDFAnnotationV1, RegionShape } from 'src/api/annotation/types';
import {
  validBoundingBox,
  validImageAssetLink,
  validKeypointCollection,
} from 'src/api/annotation/typeValidators';

describe('validBoundingBox', () => {
  test('Missing region', () => {
    const cdfAnnotationV1 = {} as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Missing shape', () => {
    const cdfAnnotationV1 = { region: {} } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Invalid shape', () => {
    const cdfAnnotationV1 = {
      region: { shape: RegionShape.Polygon },
    } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Missing vertices', () => {
    const cdfAnnotationV1 = {
      region: { shape: RegionShape.Rectangle },
    } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Too few items in vertices', () => {
    const cdfAnnotationV1 = {
      region: { shape: RegionShape.Rectangle, vertices: [{}] },
    } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Too many items in vertices', () => {
    const cdfAnnotationV1 = {
      region: { shape: RegionShape.Rectangle, vertices: [{}, {}, {}] },
    } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Invalid vertex', () => {
    const cdfAnnotationV1 = {
      region: {
        shape: RegionShape.Rectangle,
        vertices: [{ x: 1 }, { x: 1, y: 2 }],
      },
    } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Non-normalized vertices', () => {
    const cdfAnnotationV1 = {
      region: {
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 2 },
        ],
      },
    } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Overlapping vertices', () => {
    const cdfAnnotationV1 = {
      region: {
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 0, y: 0.1 },
        ],
      },
    } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(false);
  });

  test('Valid bounding box', () => {
    const cdfAnnotationV1 = {
      region: {
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      },
    } as CDFAnnotationV1;
    expect(validBoundingBox(cdfAnnotationV1)).toBe(true);
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
    const cdfAnnotationV1 = {
      linkedResourceId: 1,
      linkedResourceType: 'asset',
    } as CDFAnnotationV1;
    expect(validImageAssetLink(cdfAnnotationV1)).toBe(false);
  });

  test('Missing assetId or external id', () => {
    const cdfAnnotationV1 = { ...boundingBox } as CDFAnnotationV1;
    expect(validImageAssetLink(cdfAnnotationV1)).toBe(false);
  });

  test('Missing Linked Resource Type', () => {
    const cdfAnnotationV1 = {
      ...boundingBox,
      linkedResourceId: 1,
    } as CDFAnnotationV1;
    expect(validImageAssetLink(cdfAnnotationV1)).toBe(false);
  });

  test('Valid imageAssetLink', () => {
    const cdfAnnotationV1WithId = {
      ...boundingBox,
      linkedResourceId: 1,
      linkedResourceType: 'asset',
    } as CDFAnnotationV1;
    const cdfAnnotationV1WithExternalId = {
      ...boundingBox,
      linkedResourceId: 1,
      linkedResourceType: 'asset',
    } as CDFAnnotationV1;
    expect(validImageAssetLink(cdfAnnotationV1WithId)).toBe(true);
    expect(validImageAssetLink(cdfAnnotationV1WithExternalId)).toBe(true);
  });
});

describe('validKeypointCollection', () => {
  test('Missing data', () => {
    const cdfAnnotationV1 = {} as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Missing region', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}, {}],
      },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Missing shape', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}, {}],
      },
      region: {},
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Invalid shape', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}, {}],
      },
      region: { shape: RegionShape.Rectangle },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Missing vertices', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}, {}],
      },
      region: { shape: RegionShape.Points },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Missing keypoints metadata', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
      },
      region: {
        shape: RegionShape.Points,
        vertices: [
          { x: 1, y: 0.2 },
          { x: 1, y: 0.2 },
        ],
      },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Mismatch between keypoint metadata and vertices', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}, {}],
      },
      region: {
        shape: RegionShape.Points,
        vertices: [
          { x: 1, y: 0.2 },
          { x: 1, y: 0.2 },
        ],
      },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Invalid vertex', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}],
      },
      region: {
        shape: RegionShape.Points,
        vertices: [{ x: 1 }, { x: 1, y: 0.2 }],
      },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Non-normalized vertices', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}],
      },
      region: {
        shape: RegionShape.Points,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 2 },
        ],
      },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Overlapping vertices', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}],
      },
      region: {
        shape: RegionShape.Points,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 0, y: 0.1 },
        ],
      },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(false);
  });

  test('Valid collection', () => {
    const cdfAnnotationV1 = {
      data: {
        keypoint: true,
        keypoints: [{}, {}],
      },
      region: {
        shape: RegionShape.Points,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      },
    } as CDFAnnotationV1;
    expect(validKeypointCollection(cdfAnnotationV1)).toBe(true);
  });
});
