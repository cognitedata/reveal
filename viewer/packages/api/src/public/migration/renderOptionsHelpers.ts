/*!
 * Copyright 2022 Cognite AS
 */

import log from '@reveal/logger';
import { AntiAliasingMode, defaultRenderOptions, SsaoParameters, SsaoSampleQuality } from '@reveal/rendering';
import { assertNever, DeviceDescriptor } from '@reveal/utilities';
import { PropType } from '../../utilities/reflection';
import { Cognite3DViewerOptions } from './types';

type AntiAliasingHintOption = NonNullable<PropType<Cognite3DViewerOptions, 'antiAliasingHint'>>;
type SsaoQualityHintOption = PropType<Cognite3DViewerOptions, 'ssaoQualityHint'>;

/**
 * Determines anti-aliasing mode based on the mode requested and the device in question.
 * For mobile and tablets MSAA is disabled. FXAA is supported on all devices.
 * @param modeHint  Mode as provided in options to the viewer.
 * @param device    Descriptor for current device.
 * @returns Actual anti-aliasing mode to initialize the renderer with.
 */
export function determineAntiAliasingMode(
  modeHint: AntiAliasingHintOption | undefined,
  device: DeviceDescriptor
): {
  antiAliasing: AntiAliasingMode;
  multiSampleCount: number;
} {
  modeHint = restrictAntiAliasingModeBasedOnDevice(modeHint || 'fxaa', device);

  switch (modeHint) {
    case 'disabled':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 0 };
    case 'fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 0 };
    case 'msaa2':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 2 };
    case 'msaa4':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 4 };
    case 'msaa8':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 8 };
    case 'msaa16':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 16 };
    case 'msaa2+fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 2 };
    case 'msaa4+fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 4 };
    case 'msaa8+fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 8 };
    case 'msaa16+fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 16 };
    default:
      // Ensures there is a compile error if a case is missing
      assertNever(modeHint, `Unsupported anti-aliasing mode: ${modeHint}`);
  }
}

/**
 * Determines SSAO mode based on the mode requested and the device in question.
 * For mobile and tablets SSAO is disabled.
 * @param qualityHint Mode as provided in options to the viewer.
 * @param device    Descriptor for current device.
 * @returns Actual SSAO mode to initialize viewer with.
 */
export function determineSsaoRenderParameters(
  qualityHint: SsaoQualityHintOption,
  device: DeviceDescriptor
): SsaoParameters {
  const quality = restrictSsaoOptionBasedOnDevice(qualityHint, device);
  const ssaoParameters = { ...defaultRenderOptions.ssaoRenderParameters };
  switch (quality) {
    case undefined:
      break;
    case 'medium':
      ssaoParameters.sampleSize = SsaoSampleQuality.Medium;
      break;
    case 'high':
      ssaoParameters.sampleSize = SsaoSampleQuality.High;
      break;
    case 'veryhigh':
      ssaoParameters.sampleSize = SsaoSampleQuality.VeryHigh;
      break;
    case 'disabled':
      ssaoParameters.sampleSize = SsaoSampleQuality.None;
      break;

    default:
      assertNever(quality, `Unexpected SSAO mode: '${quality}'`);
  }

  return ssaoParameters;
}

function restrictAntiAliasingModeBasedOnDevice(
  antiAliasingHint: AntiAliasingHintOption,
  device: DeviceDescriptor
): AntiAliasingHintOption {
  if (device.deviceType === 'desktop') {
    return antiAliasingHint;
  }

  switch (antiAliasingHint) {
    case 'msaa2':
    case 'msaa4':
    case 'msaa8':
    case 'msaa16':
      log.warn(`Anti-aliasing mode '${antiAliasingHint}' is not supported on mobile devices, anti-aliasing disabled'`);
      return 'disabled';
    case 'msaa2+fxaa':
    case 'msaa4+fxaa':
    case 'msaa8+fxaa':
    case 'msaa16+fxaa':
      log.warn(`Anti-aliasing mode '${antiAliasingHint}' is not supported on mobile devices, falling back to 'fxaa'`);
      return 'fxaa';

    case 'disabled':
    case 'fxaa':
    case undefined:
      return antiAliasingHint;

    default:
      assertNever(antiAliasingHint);
  }
}

function restrictSsaoOptionBasedOnDevice(
  ssaoQualityHint: SsaoQualityHintOption,
  device: DeviceDescriptor
): SsaoQualityHintOption {
  if (device.deviceType === 'desktop') {
    return ssaoQualityHint;
  }

  switch (ssaoQualityHint) {
    case 'medium':
    case 'high':
    case 'veryhigh':
      log.warn(`SSAO is not supported on mobile devices, disabling`);
      return 'disabled';

    case 'disabled':
    case undefined:
      return ssaoQualityHint;

    default:
      assertNever(ssaoQualityHint);
  }
}
