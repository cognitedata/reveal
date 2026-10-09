/*!
 * Copyright 2022 Cognite AS
 */
import type { Cognite3DViewerOptions } from './types';
import {
  determineAntiAliasingMode,
  determineResolutionCap,
  determineSsaoRenderParameters
} from './renderOptionsHelpers';
import type { PropType } from '../../utilities/reflection';
import type { DeviceDescriptor } from '@reveal/utilities';
import { AntiAliasingMode, defaultRenderOptions, getSsaoParametersForQuality } from '@reveal/rendering';
import { Log } from '@reveal/logger';
import type { LogLevelNumbers } from 'loglevel';

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
    PropType<Cognite3DViewerOptions, 'ssaoQualityHint'>,
    DeviceDescriptor,
    ReturnType<typeof determineSsaoRenderParameters>
  ][] = [
    [undefined, mobileDevice, getSsaoParametersForQuality('disabled')],
    [undefined, tabletDevice, getSsaoParametersForQuality('disabled')],
    ['veryhigh', mobileDevice, getSsaoParametersForQuality('disabled')],
    ['medium', tabletDevice, getSsaoParametersForQuality('disabled')],
    [undefined, desktopDevice, getSsaoParametersForQuality('medium')],
    ['medium', desktopDevice, getSsaoParametersForQuality('medium')],
    ['high', desktopDevice, getSsaoParametersForQuality('high')],
    ['veryhigh', desktopDevice, getSsaoParametersForQuality('veryhigh')],
    ['disabled', desktopDevice, getSsaoParametersForQuality('disabled')]
  ];

  test.each(testCases)('ssao params %p on device %p, returns %p', (modeHint, device, expectedResult) => {
    const result = determineSsaoRenderParameters(modeHint, device);
    expect(result).toEqual(expectedResult);
  });

  test('default on desktop is the same as the default render options', () => {
    expect(determineSsaoRenderParameters(undefined, desktopDevice)).toEqual(defaultRenderOptions.ssaoRenderParameters);
  });

  test('disabled has no samples, enabled qualities have samples', () => {
    expect(determineSsaoRenderParameters('disabled', desktopDevice).sampleSize).toBe(0);
    for (const quality of ['medium', 'high', 'veryhigh'] as const) {
      expect(determineSsaoRenderParameters(quality, desktopDevice).sampleSize).toBeGreaterThan(0);
    }
  });

  test('higher qualities do not use fewer samples or lower resolution', () => {
    const medium = determineSsaoRenderParameters('medium', desktopDevice);
    const high = determineSsaoRenderParameters('high', desktopDevice);
    const veryHigh = determineSsaoRenderParameters('veryhigh', desktopDevice);

    expect(medium.halfResolution).toBe(true);
    expect(high.halfResolution).toBe(false);
    expect(veryHigh.halfResolution).toBe(false);
    expect(high.sampleSize).toBeGreaterThanOrEqual(medium.sampleSize);
    expect(veryHigh.sampleSize).toBeGreaterThanOrEqual(high.sampleSize);
    expect(veryHigh.denoiseSampleSize).toBeGreaterThanOrEqual(high.denoiseSampleSize);
  });

  test('returns a copy that can be modified without affecting later results', () => {
    const result = determineSsaoRenderParameters('high', desktopDevice);
    result.sampleSize = 1;

    expect(determineSsaoRenderParameters('high', desktopDevice).sampleSize).not.toBe(1);
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
