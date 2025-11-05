/*!
 * Copyright 2025 Cognite AS
 */
import { isAnnotationInstanceLink } from './typeGuards';
import { createAnnotationModel } from '../../../../test-utilities';

describe('typeGuard', () => {
  const textRegionMock = { xMin: 0.1, xMax: 0.5, yMin: 0.2, yMax: 0.6 };

  const instanceRefMock = {
    externalId: 'instance-1',
    space: 'test-space',
    instanceType: 'node' as const,
    sources: []
  };

  describe(isAnnotationInstanceLink.name, () => {
    it('should return true for valid instance link annotation', () => {
      const annotation = createAnnotationModel({
        data: {
          text: 'Test instance link',
          textRegion: textRegionMock,
          instanceRef: instanceRefMock
        }
      });

      expect(isAnnotationInstanceLink(annotation)).toBe(true);
    });

    it('should return false for asset link annotation', () => {
      const annotation = createAnnotationModel({
        annotationType: 'images.AssetLink',
        data: {
          text: 'Test asset link',
          textRegion: textRegionMock,
          assetRef: { id: 456 }
        }
      });

      expect(isAnnotationInstanceLink(annotation)).toBe(false);
    });

    it('should return false when instanceRef is missing', () => {
      const annotation = createAnnotationModel({
        data: {
          text: 'Test instance link',
          textRegion: textRegionMock
        }
      });

      expect(isAnnotationInstanceLink(annotation)).toBe(false);
    });

    it('should return false when text is missing', () => {
      const annotation = createAnnotationModel({
        data: {
          textRegion: textRegionMock,
          instanceRef: instanceRefMock
        }
      });

      expect(isAnnotationInstanceLink(annotation)).toBe(false);
    });

    it('should return false when textRegion is missing', () => {
      const annotation = createAnnotationModel({
        data: {
          text: 'Test instance link',
          instanceRef: instanceRefMock
        }
      });

      expect(isAnnotationInstanceLink(annotation)).toBe(false);
    });

    it('should return false for empty data object', () => {
      const annotation = createAnnotationModel({
        data: {}
      });

      expect(isAnnotationInstanceLink(annotation)).toBe(false);
    });
  });
});
