/*!
 * Copyright 2026 Cognite AS
 */
import { Mock } from 'moq.ts';
import { Color, Texture, Vector3 } from 'three';
import { OverlayPointsObject, OverlayPointsParameters } from './OverlayPointsObject';

describe(OverlayPointsObject.name, () => {
  const positions = [new Vector3(0, 0, 0), new Vector3(1, 1, 1), new Vector3(2, 2, 2), new Vector3(3, 3, 3)];

  const colors = [new Color(1, 0, 0), new Color(0, 1, 0), new Color(0, 0, 1), new Color(1, 1, 0)];

  const sizeScales = [1.0, 1.5, 2.0, 0.5];
  const clusterSizes = [5, 10, 3, 0];
  const isClusterFlags = [true, false, true, false];
  const isHoveredFlags = [false, true, false, true];

  function createMockTexture(): Texture {
    return new Mock<Texture>().object();
  }

  function createDefaultParameters(): OverlayPointsParameters {
    return {
      spriteTexture: createMockTexture(),
      minPixelSize: 10,
      maxPixelSize: 100,
      radius: 0.5
    };
  }

  function createOverlayPointsObject(maxPoints = 10): OverlayPointsObject {
    return new OverlayPointsObject(maxPoints, createDefaultParameters());
  }

  describe('constructor', () => {
    test('creates object with specified max points', () => {
      const overlay = createOverlayPointsObject(5);
      expect(overlay).toBeDefined();
      overlay.dispose();
    });

    test('creates object with cluster and number textures and check whether disposed children are removed', () => {
      const params: OverlayPointsParameters = {
        spriteTexture: createMockTexture(),
        clusterTexture: createMockTexture(),
        numberTexture: createMockTexture(),
        minPixelSize: 10,
        maxPixelSize: 100,
        radius: 0.5
      };
      const overlay = new OverlayPointsObject(10, params);
      expect(overlay).toBeDefined();

      overlay.setPoints(positions.slice(0, 2));
      expect(overlay.children.length).toBeGreaterThan(0);
      overlay.dispose();
      expect(overlay.children.length).toBe(0);
    });
  });

  describe('setPoints', () => {
    test('sets positions only', () => {
      const overlay = createOverlayPointsObject();
      expect(() => overlay.setPoints(positions.slice(0, 2))).not.toThrow();
      overlay.dispose();
    });

    test('sets positions with colors', () => {
      const overlay = createOverlayPointsObject();
      expect(() => overlay.setPoints(positions.slice(0, 2), colors.slice(0, 2))).not.toThrow();
      overlay.dispose();
    });

    test('sets positions with all optional parameters', () => {
      const overlay = createOverlayPointsObject();
      expect(() =>
        overlay.setPoints(
          positions.slice(0, 2),
          colors.slice(0, 2),
          sizeScales.slice(0, 2),
          isClusterFlags.slice(0, 2),
          clusterSizes.slice(0, 2),
          isHoveredFlags.slice(0, 2)
        )
      ).not.toThrow();
      overlay.dispose();
    });

    test('throws when colors array length mismatches positions', () => {
      const overlay = createOverlayPointsObject();
      expect(() => overlay.setPoints(positions.slice(0, 2), colors.slice(0, 1))).toThrow(
        'Points positions and colors arrays must have the same length'
      );
      overlay.dispose();
    });

    test('throws when sizeScales array length mismatches positions', () => {
      const overlay = createOverlayPointsObject();
      expect(() => overlay.setPoints(positions.slice(0, 2), undefined, sizeScales.slice(0, 1))).toThrow(
        'Points positions and sizeScales arrays must have the same length'
      );
      overlay.dispose();
    });

    test('throws when isClusterFlags array length mismatches positions', () => {
      const overlay = createOverlayPointsObject();
      expect(() => overlay.setPoints(positions.slice(0, 2), undefined, undefined, isClusterFlags.slice(0, 1))).toThrow(
        'Points positions and isClusterFlags arrays must have the same length'
      );
      overlay.dispose();
    });

    test('throws when clusterSizes array length mismatches positions', () => {
      const overlay = createOverlayPointsObject();
      expect(() =>
        overlay.setPoints(positions.slice(0, 2), undefined, undefined, undefined, clusterSizes.slice(0, 1))
      ).toThrow('Points positions and clusterSizes arrays must have the same length');
      overlay.dispose();
    });

    test('throws when isHoveredFlags array length mismatches positions', () => {
      const overlay = createOverlayPointsObject();
      expect(() =>
        overlay.setPoints(positions.slice(0, 2), undefined, undefined, undefined, undefined, isHoveredFlags.slice(0, 1))
      ).toThrow('Points positions and isHoveredFlags arrays must have the same length');
      overlay.dispose();
    });

    test('throws when points exceed maximum capacity', () => {
      const overlay = createOverlayPointsObject(2);
      expect(() => overlay.setPoints(positions)).toThrow('Points array length exceeds the maximum number of points');
      overlay.dispose();
    });

    test('handles empty points array', () => {
      const overlay = createOverlayPointsObject();
      expect(() => overlay.setPoints([])).not.toThrow();
      overlay.dispose();
    });

    test('can be called multiple times to update points', () => {
      const overlay = createOverlayPointsObject();
      overlay.setPoints(positions.slice(0, 2));
      expect(() => overlay.setPoints(positions)).not.toThrow();
      overlay.dispose();
    });
  });
});
