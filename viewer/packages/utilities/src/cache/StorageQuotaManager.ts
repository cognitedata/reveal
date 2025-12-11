/*!
 * Copyright 2025 Cognite AS
 */

import { determineCurrentDevice } from '../device';
import {
  DEFAULT_MOBILE_STORAGE_LIMIT,
  DEFAULT_TABLET_STORAGE_LIMIT,
  DEFAULT_HIGHEND_STORAGE_LIMIT,
  DEFAULT_DESKTOP_STORAGE_LIMIT
} from './constants';

type DeviceCharacteristics = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowEnd: boolean;
  isMidRange: boolean;
  isHighEnd: boolean;
};

/**
 * Detects device characteristics to inform cache size decisions
 */
export function detectDeviceCharacteristics(): DeviceCharacteristics {
  const currentDevice = determineCurrentDevice();

  // Device memory in GB (if available)
  const deviceMemory = 'deviceMemory' in navigator ? (navigator as { deviceMemory: number }).deviceMemory : undefined;

  const LOW_END_MEMORY_THRESHOLD = 4;
  const HIGH_END_MEMORY_THRESHOLD = 8;

  const isLowEnd = deviceMemory !== undefined && deviceMemory < LOW_END_MEMORY_THRESHOLD;
  const isMidRange =
    deviceMemory !== undefined && deviceMemory >= LOW_END_MEMORY_THRESHOLD && deviceMemory < HIGH_END_MEMORY_THRESHOLD;
  const isHighEnd = deviceMemory !== undefined && deviceMemory >= HIGH_END_MEMORY_THRESHOLD;

  return {
    isMobile: currentDevice.deviceType === 'mobile',
    isTablet: currentDevice.deviceType === 'tablet',
    isDesktop: currentDevice.deviceType === 'desktop',
    isLowEnd,
    isMidRange,
    isHighEnd
  };
}

/**
 * Calculates optimal cache size based on device characteristics
 */
export function calculateOptimalCacheSize(): number {
  const device = detectDeviceCharacteristics();

  if (device.isMobile || device.isLowEnd) {
    return DEFAULT_MOBILE_STORAGE_LIMIT;
  } else if (device.isTablet || device.isMidRange) {
    return DEFAULT_TABLET_STORAGE_LIMIT;
  } else if (device.isHighEnd) {
    return DEFAULT_HIGHEND_STORAGE_LIMIT;
  } else {
    return DEFAULT_DESKTOP_STORAGE_LIMIT;
  }
}
