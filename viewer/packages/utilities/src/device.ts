/*!
 * Copyright 2022 Cognite AS
 */

import { isMobile, isMobileOrTablet } from './isMobileOrTablet';

export type DeviceDescriptor = {
  deviceType: 'desktop' | 'mobile' | 'tablet';
};

/**
 * Returns a descriptor for the device this code is currently running on.
 */
export function determineCurrentDevice(): DeviceDescriptor {
  if (isMobile()) {
    return { deviceType: 'mobile' };
  }
  if (isMobileOrTablet()) {
    return { deviceType: 'tablet' };
  }
  return { deviceType: 'desktop' };
}
