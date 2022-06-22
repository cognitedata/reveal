/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DViewerOptions } from './types';
import { determineAntiAliasingMode } from './renderOptionsHelpers';
import { PropType } from '../../utilities/reflection';
import { DeviceDescriptor } from '@reveal/utilities';
import { AntiAliasingMode } from '@reveal/rendering';

describe(determineAntiAliasingMode.name, () => {
  const mobileDevice: DeviceDescriptor = { deviceType: 'mobile' };
  const tabletDevice: DeviceDescriptor = { deviceType: 'tablet' };
  const desktopDevice: DeviceDescriptor = { deviceType: 'desktop' };

  const testCases: [
    PropType<Cognite3DViewerOptions, 'antiAliasingHint'>,
    DeviceDescriptor,
    ReturnType<typeof determineAntiAliasingMode>
  ][] = [
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
