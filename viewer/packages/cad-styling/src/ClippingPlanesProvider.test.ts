/*!
 * Copyright 2026 Cognite AS
 */

import { Plane } from 'three';
import { ClippingPlanesProvider } from './ClippingPlanesProvider';
import { vi } from 'vitest';

describe(ClippingPlanesProvider, () => {
  let provider: ClippingPlanesProvider;

  beforeEach(() => {
    provider = new ClippingPlanesProvider();
  });

  test('initializes with empty clipping planes', () => {
    expect(provider.clippingPlanes).toEqual([]);
  });

  test('setter updates clipping planes', () => {
    const planes = [new Plane(), new Plane()];
    provider.clippingPlanes = planes;
    expect(provider.clippingPlanes).toBe(planes);
  });

  test('setter fires changed event with new planes', () => {
    const listener = vi.fn();
    const planes = [new Plane()];
    provider.on('changed', listener);
    provider.clippingPlanes = planes;
    expect(listener).toHaveBeenCalledWith(planes);
  });

  test('off unsubscribes listener', () => {
    const listener = vi.fn();
    provider.on('changed', listener);
    provider.off('changed', listener);
    provider.clippingPlanes = [new Plane()];
    expect(listener).not.toHaveBeenCalled();
  });

  test('dispose unsubscribes all listeners', () => {
    const listener = vi.fn();
    provider.on('changed', listener);
    provider.dispose();
    provider.clippingPlanes = [new Plane()];
    expect(listener).not.toHaveBeenCalled();
  });
});
