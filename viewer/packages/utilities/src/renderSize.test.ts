/*!
 * Copyright 2026 Cognite AS
 */

import { Vector2, type WebGLRenderer } from 'three';
import {
  getRenderCssSize,
  getRenderDownScale,
  getRenderSize,
  getRenderSizeOverride,
  setRenderSizeOverride
} from './renderSize';

function createRenderer(drawingBufferSize: Vector2, pixelRatio: number, canvasCssWidth = 800): WebGLRenderer {
  const renderer = {
    domElement: { clientWidth: canvasCssWidth },
    getDrawingBufferSize: (target: Vector2) => target.copy(drawingBufferSize),
    getSize: (target: Vector2) => target.copy(drawingBufferSize).divideScalar(pixelRatio),
    getPixelRatio: () => pixelRatio
  };
  return renderer as unknown as WebGLRenderer;
}

describe('renderSize', () => {
  test('reports the renderer size when there is no override', () => {
    const renderer = createRenderer(new Vector2(1600, 1200), 2);

    expect(getRenderSize(renderer, new Vector2())).toEqual(new Vector2(1600, 1200));
    expect(getRenderCssSize(renderer, new Vector2())).toEqual(new Vector2(800, 600));
  });

  test('reports the override when set, in physical and CSS pixels', () => {
    const renderer = createRenderer(new Vector2(1600, 1200), 2);

    setRenderSizeOverride(renderer, new Vector2(1000, 500));

    expect(getRenderSize(renderer, new Vector2())).toEqual(new Vector2(1000, 500));
    expect(getRenderCssSize(renderer, new Vector2())).toEqual(new Vector2(500, 250));
  });

  test('clearing the override restores the renderer size', () => {
    const renderer = createRenderer(new Vector2(1600, 1200), 1);
    setRenderSizeOverride(renderer, new Vector2(10, 10));

    setRenderSizeOverride(renderer, undefined);

    expect(getRenderSize(renderer, new Vector2())).toEqual(new Vector2(1600, 1200));
  });

  test('the override is copied, so later changes to the given vector have no effect', () => {
    const renderer = createRenderer(new Vector2(1600, 1200), 1);
    const size = new Vector2(100, 100);
    setRenderSizeOverride(renderer, size);

    size.set(1, 1);

    expect(getRenderSize(renderer, new Vector2())).toEqual(new Vector2(100, 100));
  });

  test('overrides are per renderer', () => {
    const overridden = createRenderer(new Vector2(1600, 1200), 1);
    const other = createRenderer(new Vector2(640, 480), 1);

    setRenderSizeOverride(overridden, new Vector2(100, 100));

    expect(getRenderSize(other, new Vector2())).toEqual(new Vector2(640, 480));
  });

  test('writes into and returns the target vector', () => {
    const renderer = createRenderer(new Vector2(1600, 1200), 1);
    const target = new Vector2();

    expect(getRenderSize(renderer, target)).toBe(target);
  });

  test('getRenderSizeOverride() returns a copy of the override, or undefined', () => {
    const renderer = createRenderer(new Vector2(1600, 1200), 1);
    expect(getRenderSizeOverride(renderer)).toBeUndefined();

    setRenderSizeOverride(renderer, new Vector2(100, 50));
    const override = getRenderSizeOverride(renderer)!;
    override.set(1, 1);

    expect(getRenderSizeOverride(renderer)).toEqual(new Vector2(100, 50));
  });

  describe('getRenderDownScale', () => {
    test('is the render width relative to the canvas CSS width', () => {
      const renderer = createRenderer(new Vector2(1600, 1200), 2, 800);

      expect(getRenderDownScale(renderer, 1600)).toBe(2);
      expect(getRenderDownScale(renderer, 400)).toBe(0.5);
    });

    test('is 1 while a render size override is active', () => {
      const renderer = createRenderer(new Vector2(1600, 1200), 2, 800);
      setRenderSizeOverride(renderer, new Vector2(2000, 2000));

      expect(getRenderDownScale(renderer, 2000)).toBe(1);
    });

    test('is 1 when the canvas has no size', () => {
      const renderer = createRenderer(new Vector2(1600, 1200), 1, 0);

      expect(getRenderDownScale(renderer, 1600)).toBe(1);
    });
  });
});
