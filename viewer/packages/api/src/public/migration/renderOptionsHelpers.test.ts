/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DViewerOptions } from './types';
import { determineAntiAliasingMode, determineSsaoRenderParameters } from './renderOptionsHelpers';
import { PropType } from '../../utilities/reflection';
import { DeviceDescriptor } from '@reveal/utilities';
import { AntiAliasingMode } from '@reveal/rendering';
import log from '@reveal/logger';
import { LogLevelNumbers } from 'loglevel';

describe(determineAntiAliasingMode.name, () => {
  let currentLogLevel: LogLevelNumbers;

  beforeAll(() => {
    currentLogLevel = log.getLevel();
    log.setLevel('ERROR');
  });

  afterAll(() => {
    log.setLevel(currentLogLevel);
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
