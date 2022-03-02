import { AnnotationRegion } from 'src/api/vision/detectionModels/types';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { enforceRegionValidity, validateAnnotation } from './utils';

describe('enforce valid regions', () => {
  it('should cap vertex coordinates within 0 and 1', () => {
    const invalidPoint1 = {
      shape: 'points',
      vertices: [{ x: -0.5, y: 0.5 }],
    };
    const desiredPoint1 = {
      shape: 'points',
      vertices: [{ x: 0, y: 0.5 }],
    };
    const invalidPoint2 = {
      shape: 'points',
      vertices: [{ x: 0.2, y: 1.5 }],
    };
    const desiredPoint2 = {
      shape: 'points',
      vertices: [{ x: 0.2, y: 1 }],
    };
    const invalidPoint3 = {
      shape: 'points',
      vertices: [{ x: -0.5, y: 1.5 }],
    };
    const desiredPoint3 = {
      shape: 'points',
      vertices: [{ x: 0, y: 1 }],
    };
    const invalidRectangle1 = {
      shape: 'rectangle',
      vertices: [
        { x: -0.2, y: 1.2 },
        { x: 0.5, y: 1.2 },
        { x: -0.2, y: 0.1 },
        { x: 0.5, y: 0.1 },
      ],
    };
    const desiredRectangle1 = {
      shape: 'rectangle',
      vertices: [
        { x: 0, y: 1 },
        { x: 0.5, y: 1 },
        { x: 0, y: 0.1 },
        { x: 0.5, y: 0.1 },
      ],
    };
    const invalidRectangle2 = {
      shape: 'rectangle',
      vertices: [
        { x: -0.2, y: 1.2 },
        { x: 0.5, y: 1.2 },
        { x: -0.2, y: -0.1 },
        { x: 0.5, y: -0.1 },
      ],
    };
    const desiredRectangle2 = {
      shape: 'rectangle',
      vertices: [
        { x: 0, y: 1 },
        { x: 0.5, y: 1 },
        { x: 0, y: 0 },
        { x: 0.5, y: 0 },
      ],
    };
    expect(
      enforceRegionValidity(invalidPoint1 as AnnotationRegion)
    ).toMatchObject(desiredPoint1);
    expect(
      enforceRegionValidity(invalidPoint2 as AnnotationRegion)
    ).toMatchObject(desiredPoint2);
    expect(
      enforceRegionValidity(invalidPoint3 as AnnotationRegion)
    ).toMatchObject(desiredPoint3);

    expect(
      enforceRegionValidity(invalidRectangle1 as AnnotationRegion)
    ).toMatchObject(desiredRectangle1);
    expect(
      enforceRegionValidity(invalidRectangle2 as AnnotationRegion)
    ).toMatchObject(desiredRectangle2);
  });
  it('should remove duplicates', () => {
    const invalidPoint1 = {
      shape: 'points',
      vertices: [
        { x: -0.5, y: 1.5 },
        { x: 0.1, y: 0.1 },
        { x: 0.1, y: 0.1 },
      ],
    };
    const desiredPoint1 = {
      shape: 'points',
      vertices: [
        { x: 0, y: 1 },
        { x: 0.1, y: 0.1 },
      ],
    };
    const invalidRectangle1 = {
      shape: 'rectangle',
      vertices: [
        { x: -0.2, y: 1.2 },
        { x: -0.2, y: 1.2 },
        { x: 0.5, y: 1.2 },
        { x: -0.2, y: 0.1 },
        { x: 0.5, y: 0.1 },
      ],
    };
    const desiredRectangle1 = {
      shape: 'rectangle',
      vertices: [
        { x: 0, y: 1 },
        { x: 0.5, y: 1 },
        { x: 0, y: 0.1 },
        { x: 0.5, y: 0.1 },
      ],
    };
    expect(
      enforceRegionValidity(invalidPoint1 as AnnotationRegion)
    ).toMatchObject(desiredPoint1);
    expect(
      enforceRegionValidity(invalidRectangle1 as AnnotationRegion)
    ).toMatchObject(desiredRectangle1);
  });
});

describe('should check validity of annotations', () => {
  const requiredAnnotationFields = {
    text: '',
    annotatedResourceId: 123435,
    annotatedResourceType: 'file',
    annotationType: 'user_defined',
    source: 'user',
  };
  const invalidPoint1 = {
    shape: 'points',
    vertices: [{ x: -0.5, y: 0.5 }],
  };
  const invalidPoint2 = {
    shape: 'points',
    vertices: [{ x: 0.5, y: 1.5 }],
  };
  const invalidPoint3 = {
    shape: 'points',
    vertices: [{ x: 1.5, y: 0.5 }],
  };
  const invalidPoint4 = {
    shape: 'points',
    vertices: [{ x: 0.7, y: -0.5 }],
  };
  const invalidPoint5 = {
    shape: 'points',
    vertices: [{ x: -0.7, y: 1.5 }],
  };
  const invalidPoint6 = {
    shape: 'points',
    vertices: [{ x: 1.1, y: -0.5 }],
  };
  const duplicatedVerticesPoint = {
    shape: 'points',
    vertices: [
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0.5 },
    ],
  };
  const desiredRectangle1 = {
    shape: 'rectangle',
    vertices: [
      { x: 0, y: 1 },
      { x: 0.5, y: 1 },
      { x: 0, y: 0.1 },
      { x: 0.5, y: 0.1 },
    ],
  };

  it('should not accept annotations without region', () => {
    expect(
      validateAnnotation(requiredAnnotationFields as UnsavedAnnotation)
    ).toBeFalsy();
  });

  const coordinatesOutOfBounds =
    'Annotation coordinates must be between 0 and 1 and cannot be duplicate.';

  it('should not accept annotations if vertex coordinates are not within 0 and 1', async () => {
    await expect(() =>
      validateAnnotation({
        ...requiredAnnotationFields,
        region: invalidPoint1,
      } as UnsavedAnnotation)
    ).toThrow(coordinatesOutOfBounds);
    await expect(() =>
      validateAnnotation({
        ...requiredAnnotationFields,
        region: invalidPoint2,
      } as UnsavedAnnotation)
    ).toThrow(coordinatesOutOfBounds);
    await expect(() =>
      validateAnnotation({
        ...requiredAnnotationFields,
        region: invalidPoint3,
      } as UnsavedAnnotation)
    ).toThrow(coordinatesOutOfBounds);
    await expect(() =>
      validateAnnotation({
        ...requiredAnnotationFields,
        region: invalidPoint4,
      } as UnsavedAnnotation)
    ).toThrow(coordinatesOutOfBounds);
    await expect(() =>
      validateAnnotation({
        ...requiredAnnotationFields,
        region: invalidPoint5,
      } as UnsavedAnnotation)
    ).toThrow(coordinatesOutOfBounds);
    await expect(() =>
      validateAnnotation({
        ...requiredAnnotationFields,
        region: invalidPoint6,
      } as UnsavedAnnotation)
    ).toThrow(coordinatesOutOfBounds);
  });
  it('should not accept annotations if vertex coordinates are duplicated', async () => {
    await expect(() =>
      validateAnnotation({
        ...requiredAnnotationFields,
        region: duplicatedVerticesPoint,
      } as UnsavedAnnotation)
    ).toThrow(coordinatesOutOfBounds);
  });
  it('should accept annotations if vertex coordinates are valid', () => {
    expect(
      validateAnnotation({
        ...requiredAnnotationFields,
        region: desiredRectangle1,
      } as UnsavedAnnotation)
    ).toBeTruthy();
  });
});
