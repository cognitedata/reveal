/*!
 * Copyright 2026 Cognite AS
 */

import { resetAttributeUploadState } from './disposeAttributeArrayOnUpload';

/**
 * GPU capacity for the current page. Classifies the renderer as standard or
 * constrained, remembers a session tighten level, and reports the point-budget
 * cap, the resolution cap, and whether point CPU buffers should be released.
 */

export const GPU_CAPACITY_STORAGE_KEY = 'reveal.gpu-capacity.tightened';

export const CONSTRAINED_POINT_BUDGET = 1_000_000;
export const CONSTRAINED_RESOLUTION_CAP = 700_000;
export const TIGHTER_POINT_BUDGET = 400_000;
export const TIGHTER_RESOLUTION_CAP = 400_000;

export type GpuCapacityClass = 'standard' | 'constrained';

export type GpuCapacityProbe = {
  renderer: string;
  deviceMemoryGb?: number;
};

let capacityClass: GpuCapacityClass = 'standard';
let tightenLevel = 0;
let lastProbe: GpuCapacityProbe = { renderer: '' };

export function resetGpuCapacityState(): void {
  capacityClass = 'standard';
  tightenLevel = 0;
  lastProbe = { renderer: '' };
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(GPU_CAPACITY_STORAGE_KEY);
    }
  } catch {}
  resetAttributeUploadState();
}

export function classifyGpu(probe: GpuCapacityProbe): GpuCapacityClass {
  const renderer = probe.renderer.toLowerCase();
  if (isDiscreteGpu(renderer)) {
    return 'standard';
  }
  if (isIntegratedOrSoftwareGpu(renderer)) {
    return 'constrained';
  }
  if (renderer.trim() === '' && probe.deviceMemoryGb !== undefined && probe.deviceMemoryGb <= 8) {
    return 'constrained';
  }
  return 'standard';
}

export function readGpuCapacityProbe(
  gl: WebGLRenderingContext | WebGL2RenderingContext | null | undefined
): GpuCapacityProbe {
  let renderer = '';
  try {
    if (gl) {
      const debug = gl.getExtension('WEBGL_debug_renderer_info') as { UNMASKED_RENDERER_WEBGL: number } | null;
      if (debug) {
        const value = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);
        renderer = typeof value === 'string' ? value : '';
      }
    }
  } catch {
    renderer = '';
  }

  const deviceMemoryGb = readDeviceMemoryGb();
  return deviceMemoryGb === undefined ? { renderer } : { renderer, deviceMemoryGb };
}

export function noteGpuCapacity(probe: GpuCapacityProbe): GpuCapacityClass {
  lastProbe = probe;
  capacityClass = classifyGpu(probe);
  tightenLevel = Math.max(tightenLevel, readPersistedTightenLevel());
  return capacityClass;
}

export function describeGpuCapacity(): {
  renderer: string;
  deviceMemoryGb?: number;
  capacityClass: GpuCapacityClass;
  tightenLevel: number;
  constrained: boolean;
  releasePointCpuBuffers: boolean;
  pointBudgetCap: number;
  resolutionCap: number;
} {
  return {
    renderer: lastProbe.renderer,
    deviceMemoryGb: lastProbe.deviceMemoryGb,
    capacityClass,
    tightenLevel,
    constrained: isGpuConstrained(),
    releasePointCpuBuffers: shouldReleasePointCpuBuffers(),
    pointBudgetCap: activePointBudgetCap(),
    resolutionCap: activeResolutionCap()
  };
}

export function isGpuConstrained(): boolean {
  return capacityClass === 'constrained' || tightenLevel > 0;
}

export function shouldReleasePointCpuBuffers(): boolean {
  return isGpuConstrained();
}

export function activePointBudgetCap(): number {
  if (useTighterCap()) {
    return TIGHTER_POINT_BUDGET;
  }
  if (isGpuConstrained()) {
    return CONSTRAINED_POINT_BUDGET;
  }
  return Number.POSITIVE_INFINITY;
}

export function activeResolutionCap(): number {
  if (useTighterCap()) {
    return TIGHTER_RESOLUTION_CAP;
  }
  if (isGpuConstrained()) {
    return CONSTRAINED_RESOLUTION_CAP;
  }
  return Number.POSITIVE_INFINITY;
}

export function tightenGpuCapacityAfterContextLoss(): { pointBudget: number; resolutionCap: number } {
  tightenLevel = Math.min(tightenLevel + 1, 2);
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(GPU_CAPACITY_STORAGE_KEY, String(tightenLevel));
    }
  } catch {}
  return { pointBudget: activePointBudgetCap(), resolutionCap: activeResolutionCap() };
}

function useTighterCap(): boolean {
  return tightenLevel >= 2 || (tightenLevel >= 1 && capacityClass === 'constrained');
}

function isDiscreteGpu(renderer: string): boolean {
  return /nvidia|geforce|quadro|\brtx\b|\bgtx\b|radeon|intel\(r\) arc|intel arc/.test(renderer);
}

function isIntegratedOrSoftwareGpu(renderer: string): boolean {
  if (/swiftshader|llvmpipe|basic render|mali|adreno/.test(renderer)) {
    return true;
  }
  if (!/intel/.test(renderer) || /arc/.test(renderer)) {
    return false;
  }
  return /iris|uhd|hd graphics|intel\(r\) graphics|intel graphics/.test(renderer);
}

function readDeviceMemoryGb(): number | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof memory === 'number' ? memory : undefined;
}

function readPersistedTightenLevel(): number {
  try {
    if (typeof sessionStorage === 'undefined') {
      return 0;
    }
    const stored = Number(sessionStorage.getItem(GPU_CAPACITY_STORAGE_KEY));
    if (!Number.isFinite(stored) || stored < 1) {
      return 0;
    }
    return Math.min(Math.floor(stored), 2);
  } catch {
    return 0;
  }
}
