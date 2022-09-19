/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { createGlContext } from '../../../test-utilities';
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

  test('setScissorTest()', () => {
    renderer.setScissorTest(true);
    const helper = new WebGLRendererStateHelper(renderer);
    const setScissorTestSpy = jest.spyOn(renderer, 'setScissorTest');

    helper.setScissorTest(false);
    expect(setScissorTestSpy).toBeCalledWith(false);

    helper.resetState();
    expect(setScissorTestSpy).toBeCalledWith(true);
  });

  test('setScissor()', () => {
    renderer.setScissor(0, 0, 64, 64);
    const helper = new WebGLRendererStateHelper(renderer);
    const setScissorSpy = jest.spyOn(renderer, 'setScissor');

    helper.setScissor(0, 0, 128, 128);
    expect(setScissorSpy).toBeCalledWith(0, 0, 128, 128);

    helper.resetState();
    expect(setScissorSpy).toBeCalledWith(new THREE.Vector4(0, 0, 64, 64));
  });

  test('setWebGLState', () => {
    const helper = new WebGLRendererStateHelper(renderer);
    const depthSetTestSpy = jest.spyOn(renderer.state.buffers.depth, 'setTest');
    const depthSetMaskSpy = jest.spyOn(renderer.state.buffers.depth, 'setMask');

    helper.setWebGLState(
      { buffers: { depth: { test: false, mask: false } } },
      { buffers: { depth: { test: true, mask: true } } }
    );
    expect(depthSetTestSpy).toBeCalledWith(false);
    expect(depthSetMaskSpy).toBeCalledWith(false);

    helper.resetState();
    expect(depthSetTestSpy).toBeCalledWith(true);
    expect(depthSetMaskSpy).toBeCalledWith(true);
  });
});
