/*!
 * Copyright 2026 Cognite AS
 */
import { DepthTexture, Texture } from 'three';
import { getPointCloudPostProcessingMaterial } from './renderUtilities';
import type { PointCloudPostProcessingOptions } from '../render-passes/types';
import {
  DEFAULT_EDL_NEIGHBOURS_COUNT,
  DEFAULT_POINTCLOUD_GAP_FILL_DEPTH_TOLERANCE,
  DEFAULT_POINTCLOUD_GAP_FILL_GRAZE_TOLERANCE,
  DEFAULT_POINTCLOUD_GAP_FILL_MAX_WORLD_GAP,
  DEFAULT_POINTCLOUD_GAP_FILL_MIN_COVERAGE_WEIGHT,
  DEFAULT_POINTCLOUD_GAP_FILL_RADIUS,
  DEFAULT_POINTCLOUD_GAP_FILL_STEPS
} from '../pointcloud-rendering/constants';

function createOptions(overrides: Partial<PointCloudPostProcessingOptions> = {}): PointCloudPostProcessingOptions {
  return {
    logDepthTexture: new Texture(),
    texture: new Texture(),
    depthTexture: new DepthTexture(1, 1),
    pointBlending: false,
    edlOptions: { strength: 0, radius: 0 },
    ...overrides
  };
}

describe(getPointCloudPostProcessingMaterial.name, () => {
  test('always enables gap filling with the configured defines and uniforms', () => {
    const material = getPointCloudPostProcessingMaterial(createOptions());

    expect(material.defines['fill_gaps']).toBe(true);
    expect(material.defines['FILL_GAPS_RADIUS']).toBe(DEFAULT_POINTCLOUD_GAP_FILL_RADIUS);
    expect(material.defines['FILL_GAPS_MIN_COVERED']).toBe(Math.max(2, DEFAULT_POINTCLOUD_GAP_FILL_RADIUS));
    expect(material.defines['FILL_GAPS_STEPS']).toBe(DEFAULT_POINTCLOUD_GAP_FILL_STEPS);
    expect(material.defines['FILL_GAPS_MAX_WORLD_GAP']).toBe(DEFAULT_POINTCLOUD_GAP_FILL_MAX_WORLD_GAP);
    expect(material.defines['FILL_GAPS_DEPTH_TOL']).toBe(DEFAULT_POINTCLOUD_GAP_FILL_DEPTH_TOLERANCE);
    expect(material.defines['FILL_GAPS_GRAZE_TOL']).toBe(DEFAULT_POINTCLOUD_GAP_FILL_GRAZE_TOLERANCE);
    expect(material.defines['FILL_GAPS_MIN_COVERAGE_WEIGHT']).toBe(DEFAULT_POINTCLOUD_GAP_FILL_MIN_COVERAGE_WEIGHT);

    expect(material.uniforms.screenWidth.value).toBe(1);
    expect(material.uniforms.screenHeight.value).toBe(1);
    expect(material.uniforms.cameraNear.value).toBe(0.1);
    expect(material.uniforms.cameraFar.value).toBe(1000);
    expect(material.uniforms.worldPerPixelUnitDepth.value).toBe(0);
  });

  test.each([0, -3])('disables gap filling when the requested radius is %s', gapFillRadius => {
    const material = getPointCloudPostProcessingMaterial(createOptions({ gapFillRadius }));

    expect(material.defines['fill_gaps']).toBeUndefined();
    expect(material.defines['FILL_GAPS_RADIUS']).toBeUndefined();
    expect(material.uniforms.cameraNear).toBeUndefined();
    expect(material.uniforms.worldPerPixelUnitDepth).toBeUndefined();
  });

  test.each<[number, number, number]>([
    [1, 1, 2],
    [4, 4, 4],
    [3.9, 3, 3]
  ])(
    'requested radius %s gives FILL_GAPS_RADIUS %s and FILL_GAPS_MIN_COVERED %s',
    (gapFillRadius, expectedRadius, expectedMinCovered) => {
      const material = getPointCloudPostProcessingMaterial(createOptions({ gapFillRadius }));

      expect(material.defines['fill_gaps']).toBe(true);
      expect(material.defines['FILL_GAPS_RADIUS']).toBe(expectedRadius);
      expect(material.defines['FILL_GAPS_MIN_COVERED']).toBe(expectedMinCovered);
    }
  );

  test('sets points_blend define when point blending is requested', () => {
    const material = getPointCloudPostProcessingMaterial(createOptions({ pointBlending: true }));

    expect(material.defines['points_blend']).toBe(true);
  });

  test('does not set the EDL define when the EDL options are a no-op', () => {
    const material = getPointCloudPostProcessingMaterial(createOptions({ edlOptions: { strength: 0, radius: 0 } }));

    expect(material.defines['use_edl']).toBeUndefined();
  });

  test('sets EDL defines and uniforms, without a typo in screenHeight, when EDL is enabled', () => {
    const material = getPointCloudPostProcessingMaterial(createOptions({ edlOptions: { strength: 0.8, radius: 2 } }));

    expect(material.defines['use_edl']).toBe(true);
    expect(material.defines['NEIGHBOUR_COUNT']).toBe(DEFAULT_EDL_NEIGHBOURS_COUNT);

    expect(material.uniforms.edlStrength.value).toBe(0.8);
    expect(material.uniforms.radius.value).toBe(2);
    expect(material.uniforms.screenHeight).toBeDefined();
    expect(material.uniforms['screeHeight']).toBeUndefined();
  });
});
