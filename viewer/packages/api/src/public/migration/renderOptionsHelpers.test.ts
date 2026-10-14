/*!
 * Copyright 2022 Cognite AS
 */
import type { Cognite3DViewerOptions } from './types';
import {
  createCompleteEdlOptions,
  determineAntiAliasingMode,
  determineResolutionCap,
  determineSsaoRenderParameters
} from './renderOptionsHelpers';
import type { PropType } from '../../utilities/reflection';
import type { DeviceDescriptor } from '@reveal/utilities';
import { AntiAliasingMode, defaultRenderOptions, MAX_EDL_RADIUS } from '@reveal/rendering';
import { Log } from '@reveal/logger';
import type { LogLevelNumbers } from 'loglevel';
import { vi } from 'vitest';

describe(determineAntiAliasingMode.name, () => {
  let currentLogLevel: LogLevelNumbers;

  beforeAll(() => {
    currentLogLevel = Log.getLevel();
    Log.setLevel('ERROR');
  });

  afterAll(() => {
    Log.setLevel(currentLogLevel);
  });

  const mobileDevice: DeviceDescriptor = { deviceType: 'mobile' };
  const tabletDevice: DeviceDescriptor = { deviceType: 'tablet' };
  const desktopDevice: DeviceDescriptor = { deviceType: 'desktop' };

  const testCases: [
    PropType<Cognite3DViewerOptions, 'antiAliasingHint'>,
    DeviceDescriptor,
    ReturnType<typeof determineAntiAliasingMode>
  ][] = [
    [undefined, mobileDevice, { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 0 }],
    [undefined, tabletDevice, { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 0 }],
    ['disabled', mobileDevice, { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 0 }],
    ['msaa8', mobileDevice, { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 0 }],
    ['msaa16+fxaa', mobileDevice, { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 0 }],
    ['fxaa', tabletDevice, { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 0 }],
    ['msaa4', tabletDevice, { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 0 }],
    ['msaa16+fxaa', desktopDevice, { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 16 }],
    ['fxaa', desktopDevice, { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 0 }],
    ['disabled', desktopDevice, { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 0 }]
  ];
  test.each(testCases)('mode %p on device %p, returns %p', (modeHint, device, expectedResult) => {
    const result = determineAntiAliasingMode(modeHint, device);
    expect(result).toEqual(expectedResult);
  });
});

describe(determineSsaoRenderParameters.name, () => {
  const mobileDevice: DeviceDescriptor = { deviceType: 'mobile' };
  const tabletDevice: DeviceDescriptor = { deviceType: 'tablet' };
  const desktopDevice: DeviceDescriptor = { deviceType: 'desktop' };

  const testCases: [
    PropType<Cognite3DViewerOptions, 'ssaoQualityHint'>,
    DeviceDescriptor,
    ReturnType<typeof determineSsaoRenderParameters>
  ][] = [
    [undefined, mobileDevice, { sampleSize: 0, depthCheckBias: 0.0125, sampleRadius: 1.0 }],
    [undefined, tabletDevice, { sampleSize: 0, depthCheckBias: 0.0125, sampleRadius: 1.0 }],
    [undefined, desktopDevice, { sampleSize: 32, depthCheckBias: 0.0125, sampleRadius: 1.0 }]
  ];

  test.each(testCases)('ssao params %p on device %p, returns %p', (modeHint, device, expectedResult) => {
    const result = determineSsaoRenderParameters(modeHint, device);
    expect(result).toEqual(expectedResult);
  });
});

describe(determineResolutionCap.name, () => {
  const mobileDevice: DeviceDescriptor = { deviceType: 'mobile' };
  const tabletDevice: DeviceDescriptor = { deviceType: 'tablet' };
  const desktopDevice: DeviceDescriptor = { deviceType: 'desktop' };

  test.each([mobileDevice, tabletDevice, desktopDevice])('default resolution cap on device %p', deviceDescriptor => {
    const mockDPR = 2;
    const defaultResolutionThreshold = 1.4e6;
    const resolutionCap = determineResolutionCap(undefined, deviceDescriptor, mockDPR);

    expect(resolutionCap).toEqual(
      deviceDescriptor.deviceType !== 'desktop' ? defaultResolutionThreshold / mockDPR : defaultResolutionThreshold
    );
  });
});

describe(createCompleteEdlOptions.name, () => {
  let currentLogLevel: LogLevelNumbers;

  beforeAll(() => {
    currentLogLevel = Log.getLevel();
    Log.setLevel('ERROR');
  });

  afterAll(() => {
    Log.setLevel(currentLogLevel);
  });

  test('returns the default options when none are given', () => {
    expect(createCompleteEdlOptions(undefined)).toEqual(defaultRenderOptions.pointCloudParameters.edlOptions);
  });

  test('disables EDL when given "disabled"', () => {
    expect(createCompleteEdlOptions('disabled')).toEqual({ radius: 0, strength: 0 });
  });

  test('fills in unspecified values from the defaults', () => {
    const defaults = defaultRenderOptions.pointCloudParameters.edlOptions;
    expect(createCompleteEdlOptions({ strength: 1 })).toEqual({ radius: defaults.radius, strength: 1 });
    expect(createCompleteEdlOptions({ radius: 3 })).toEqual({ radius: 3, strength: defaults.strength });
  });

  test('falls back to the defaults for values explicitly set to undefined', () => {
    const defaults = defaultRenderOptions.pointCloudParameters.edlOptions;
    expect(createCompleteEdlOptions({ radius: undefined, strength: undefined })).toEqual(defaults);
    expect(createCompleteEdlOptions({ radius: undefined, strength: 1 })).toEqual({
      radius: defaults.radius,
      strength: 1
    });
    expect(createCompleteEdlOptions({ radius: 3, strength: undefined })).toEqual({
      radius: 3,
      strength: defaults.strength
    });
  });

  test('keeps a radius at the maximum unchanged', () => {
    expect(createCompleteEdlOptions({ radius: MAX_EDL_RADIUS, strength: 1 })).toEqual({
      radius: MAX_EDL_RADIUS,
      strength: 1
    });
  });

  test('clamps a radius above the maximum and keeps the other values', () => {
    expect(createCompleteEdlOptions({ radius: 10, strength: 1 })).toEqual({ radius: MAX_EDL_RADIUS, strength: 1 });
  });

  test('warns when the radius is clamped', () => {
    const warnSpy = vi.spyOn(Log, 'warn').mockImplementation(() => {});

    createCompleteEdlOptions({ radius: 10 });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
