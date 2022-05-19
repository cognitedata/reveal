/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewerOptions } from './types';

import log from '@reveal/logger';
import { assertNever, isMobileOrTablet } from '@reveal/utilities';

/**
 * Modifies options to disable features we don't support on the current device. The following options might be modified:
 * - SSAO - disabled for mobile/tablet
 * - Anti-aliasing - for mobile/tablet we will fall back to FXAA when MSAA is enabled.
 * @param options
 */
export function restrictViewerOptionsToDevice(options: Cognite3DViewerOptions): void {
  options.antiAliasingHint = restrictAntialiasOption(options.antiAliasingHint);
  options.ssaoQualityHint = restrictSsaoOption(options.ssaoQualityHint);
}

type AntiAliasingHint = Cognite3DViewerOptions['antiAliasingHint'] | undefined;
type SsaoQualityHint = Cognite3DViewerOptions['ssaoQualityHint'] | undefined;

function restrictAntialiasOption(antiAliasingHint: AntiAliasingHint): AntiAliasingHint {
  if (!isMobileOrTablet()) {
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

function restrictSsaoOption(ssaoQualityHint: SsaoQualityHint): SsaoQualityHint {
  if (!isMobileOrTablet()) {
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
