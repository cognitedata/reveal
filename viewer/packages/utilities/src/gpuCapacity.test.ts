/*!
 * Copyright 2026 Cognite AS
 */

import {
  activePointBudgetCap,
  activeResolutionCap,
  classifyGpu,
  CONSTRAINED_POINT_BUDGET,
  CONSTRAINED_RESOLUTION_CAP,
  GPU_CAPACITY_STORAGE_KEY,
  isGpuConstrained,
  noteGpuCapacity,
  readGpuCapacityProbe,
  resetGpuCapacityState,
  shouldReleasePointCpuBuffers,
  TIGHTER_POINT_BUDGET,
  TIGHTER_RESOLUTION_CAP,
  tightenGpuCapacityAfterContextLoss
} from './gpuCapacity';

const IRIS_XE =
  'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x000046A6) Direct3D11 vs_5_0 ps_5_0, D3D11-31.0.101.4502)';

describe(classifyGpu.name, () => {
  afterEach(() => {
    resetGpuCapacityState();
  });

  test('treats Intel integrated GPUs as constrained', () => {
    expect(classifyGpu({ renderer: IRIS_XE, deviceMemoryGb: 8 })).toBe('constrained');
    expect(classifyGpu({ renderer: 'Intel(R) UHD Graphics 620', deviceMemoryGb: 16 })).toBe('constrained');
    expect(classifyGpu({ renderer: 'Intel(R) HD Graphics 620' })).toBe('constrained');
    expect(classifyGpu({ renderer: 'Intel(R) Graphics' })).toBe('constrained');
  });

  test('keeps discrete GPUs on the desktop budget', () => {
    expect(classifyGpu({ renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11)', deviceMemoryGb: 8 })).toBe(
      'standard'
    );
    expect(classifyGpu({ renderer: 'Intel(R) Arc(TM) A770 Graphics', deviceMemoryGb: 8 })).toBe('standard');
    expect(classifyGpu({ renderer: 'AMD Radeon RX 6800', deviceMemoryGb: 8 })).toBe('standard');
    expect(classifyGpu({ renderer: 'Apple M2', deviceMemoryGb: 8 })).toBe('standard');
  });

  test('constrains a hidden renderer only when device memory is small', () => {
    expect(classifyGpu({ renderer: '', deviceMemoryGb: 8 })).toBe('constrained');
    expect(classifyGpu({ renderer: '' })).toBe('standard');
    expect(classifyGpu({ renderer: '', deviceMemoryGb: 16 })).toBe('standard');
  });

  test('reads the unmasked renderer and ignores a probe that throws', () => {
    const gl = {
      getExtension: () => ({ UNMASKED_RENDERER_WEBGL: 1 }),
      getParameter: () => IRIS_XE
    } as unknown as WebGL2RenderingContext;

    expect(readGpuCapacityProbe(gl).renderer).toBe(IRIS_XE);

    const broken = {
      getExtension: () => {
        throw new Error('no setup');
      }
    } as unknown as WebGL2RenderingContext;
    expect(readGpuCapacityProbe(broken).renderer).toBe('');
    expect(readGpuCapacityProbe(null).renderer).toBe('');
  });

  test('lowers the cap for a constrained GPU and tightens further after context loss', () => {
    noteGpuCapacity({ renderer: IRIS_XE, deviceMemoryGb: 8 });

    expect(isGpuConstrained()).toBe(true);
    expect(shouldReleasePointCpuBuffers()).toBe(true);
    expect(activePointBudgetCap()).toBe(CONSTRAINED_POINT_BUDGET);
    expect(activeResolutionCap()).toBe(CONSTRAINED_RESOLUTION_CAP);

    tightenGpuCapacityAfterContextLoss();

    expect(activePointBudgetCap()).toBe(TIGHTER_POINT_BUDGET);
    expect(activeResolutionCap()).toBe(TIGHTER_RESOLUTION_CAP);
    expect(sessionStorage.getItem(GPU_CAPACITY_STORAGE_KEY)).toBe('1');
  });

  test('keeps a discrete GPU at the desktop cap until the context is lost', () => {
    noteGpuCapacity({ renderer: 'NVIDIA GeForce RTX 3060', deviceMemoryGb: 8 });

    expect(isGpuConstrained()).toBe(false);
    expect(shouldReleasePointCpuBuffers()).toBe(false);
    expect(activePointBudgetCap()).toBe(Number.POSITIVE_INFINITY);

    const first = tightenGpuCapacityAfterContextLoss();
    expect(first).toEqual({ pointBudget: CONSTRAINED_POINT_BUDGET, resolutionCap: CONSTRAINED_RESOLUTION_CAP });
    expect(shouldReleasePointCpuBuffers()).toBe(true);

    const second = tightenGpuCapacityAfterContextLoss();
    expect(second).toEqual({ pointBudget: TIGHTER_POINT_BUDGET, resolutionCap: TIGHTER_RESOLUTION_CAP });
    expect(sessionStorage.getItem(GPU_CAPACITY_STORAGE_KEY)).toBe('2');
  });

  test('restores a persisted tighten level on the next viewer', () => {
    sessionStorage.setItem(GPU_CAPACITY_STORAGE_KEY, '2');
    noteGpuCapacity({ renderer: 'NVIDIA GeForce RTX 3060', deviceMemoryGb: 32 });

    expect(activePointBudgetCap()).toBe(TIGHTER_POINT_BUDGET);
    expect(activeResolutionCap()).toBe(TIGHTER_RESOLUTION_CAP);
  });
});
