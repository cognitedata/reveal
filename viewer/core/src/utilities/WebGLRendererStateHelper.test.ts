/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { createGlContext } from '../__testutilities__/createGlContext';
import { WebGLRendererStateHelper } from './WebGLRendererStateHelper';

describe('WebGLRendererStateHelper', () => {
  let renderer: THREE.WebGLRenderer;
  const glContext = createGlContext(64, 64, { preserveDrawingBuffer: true });

  beforeEach(() => {
    renderer = new THREE.WebGLRenderer({ context: glContext });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('setClearColor()', () => {
    renderer.setClearColor('#AABBCC', 0.5);
    const originalColor = renderer.getClearColor(new THREE.Color());
    const originalAlpha = renderer.getClearAlpha();

    const helper = new WebGLRendererStateHelper(renderer);
    const setClearColorSpy = jest.spyOn(renderer, 'setClearColor');

    helper.setClearColor('#112233', 0.8);
    expect(setClearColorSpy).toBeCalledWith('#112233', 0.8);

    helper.resetState();
    expect(setClearColorSpy).toBeCalledWith(originalColor, originalAlpha);
  });

  test('setSize()', () => {
    renderer.setSize(128, 256);

    const helper = new WebGLRendererStateHelper(renderer);
    const setSizeSpy = jest.spyOn(renderer, 'setSize');

    helper.setSize(640, 480);
    expect(setSizeSpy).toBeCalledWith(640, 480);

    helper.resetState();
    expect(setSizeSpy).toBeCalledWith(128, 256);
  });

  test('setRenderTarget()', () => {
    const originalTarget = new THREE.WebGLRenderTarget(64, 64);
    const newTarget = new THREE.WebGLRenderTarget(64, 64);
    renderer.setRenderTarget(originalTarget);

    const helper = new WebGLRendererStateHelper(renderer);
    const setRenderTargetSpy = jest.spyOn(renderer, 'setRenderTarget');

    helper.setRenderTarget(newTarget);
    expect(setRenderTargetSpy).toBeCalledWith(newTarget);

    helper.resetState();
    expect(setRenderTargetSpy).toBeCalledWith(originalTarget);
  });

  test('setRenderTarget()', () => {
    const originalTarget = new THREE.WebGLRenderTarget(64, 64);
    const newTarget = new THREE.WebGLRenderTarget(64, 64);
    renderer.setRenderTarget(originalTarget);

    const helper = new WebGLRendererStateHelper(renderer);
    const setRenderTargetSpy = jest.spyOn(renderer, 'setRenderTarget');

    helper.setRenderTarget(newTarget);
    expect(setRenderTargetSpy).toBeCalledWith(newTarget);

    helper.resetState();
    expect(setRenderTargetSpy).toBeCalledWith(originalTarget);
  });

  test('set localClippingEnabled', () => {
    renderer.localClippingEnabled = true;

    const helper = new WebGLRendererStateHelper(renderer);
    const setLocalClippingEnabledSpy = jest.fn();
    Object.defineProperty(renderer, 'localClippingEnabled', {
      set: setLocalClippingEnabledSpy,
      get: () => true
    });

    helper.localClippingEnabled = false;
    expect(setLocalClippingEnabledSpy).toBeCalledWith(false);

    helper.resetState();
    expect(setLocalClippingEnabledSpy).toBeCalledWith(true);
  });

  test('set autoClear', () => {
    renderer.autoClear = true;
    const helper = new WebGLRendererStateHelper(renderer);
    const setAutoClearSpy = jest.fn();
    Object.defineProperty(renderer, 'autoClear', {
      set: setAutoClearSpy,
      get: () => true
    });

    helper.autoClear = false;
    expect(setAutoClearSpy).toBeCalledWith(false);

    helper.resetState();
    expect(setAutoClearSpy).toBeCalledWith(true);
  });
});
