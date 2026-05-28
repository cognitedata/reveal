/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { WebGLRendererStateHelper } from './WebGLRendererStateHelper';

import { Mock as ViMock, vi } from 'vitest';
import { It, Mock } from 'moq.ts';
import { autoMockWebGLRenderer } from '../../../test-utilities';

describe('WebGLRendererStateHelper', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('setClearColor()', () => {
    const setClearColorSpy = vi.fn();
    const renderer = mockedWebGLRenderer(setClearColorSpy).object();
    renderer.setClearColor('#AABBCC', 0.5);
    const originalColor = renderer.getClearColor(new THREE.Color());
    const originalAlpha = renderer.getClearAlpha();

    const helper = new WebGLRendererStateHelper(renderer);
    const color = new THREE.Color('#112233');

    helper.setClearColor(color, 0.8);
    expect(setClearColorSpy).toHaveBeenCalledWith(color, 0.8);

    helper.resetState();
    expect(setClearColorSpy).toHaveBeenCalledWith(originalColor, originalAlpha);

    function mockedWebGLRenderer(setClearColorSpy: THREE.WebGLRenderer['setClearColor']): Mock<THREE.WebGLRenderer> {
      const rendererMock = new Mock<THREE.WebGLRenderer>();
      const state = {
        clearColor: new THREE.Color(),
        clearAlpha: 0
      };
      rendererMock
        .setup(instance =>
          instance.setClearColor(
            It.Is<THREE.Color>(value => {
              state.clearColor.copy(value);
              return true;
            }),
            It.Is<number>(value => {
              state.clearAlpha = value;
              return true;
            })
          )
        )
        .returns()
        .setup(instance => instance.getClearColor(It.IsAny()))
        .returns(state.clearColor.clone())
        .setup(instance => instance.getClearAlpha())
        .returns(state.clearAlpha)
        .setup(instance => instance.setClearColor)
        .returns(setClearColorSpy);

      return rendererMock;
    }
  });

  test('setSize()', () => {
    const setSizeSpy = vi.fn();
    const renderer = mockedWebGLRenderer(setSizeSpy).object();
    renderer.setSize(128, 256);

    const helper = new WebGLRendererStateHelper(renderer);

    helper.setSize(640, 480);
    expect(setSizeSpy).toHaveBeenCalledWith(640, 480);

    helper.resetState();
    expect(setSizeSpy).toHaveBeenCalledWith(128, 256);

    function mockedWebGLRenderer(setSizeSpy: THREE.WebGLRenderer['setSize']): Mock<THREE.WebGLRenderer> {
      const rendererMock = new Mock<THREE.WebGLRenderer>();
      const state = {
        width: 0,
        height: 0
      };
      rendererMock
        .setup(instance =>
          instance.setSize(
            It.Is<number>(value => {
              state.width = value;
              return true;
            }),
            It.Is<number>(value => {
              state.height = value;
              return true;
            })
          )
        )
        .returns()
        .setup(instance => instance.getSize(It.IsAny()))
        .callback(() => new THREE.Vector2(state.width, state.height))
        .setup(instance => instance.setSize)
        .returns(setSizeSpy);

      return rendererMock;
    }
  });

  test('setRenderTarget()', () => {
    const setRenderTargetSpy = vi.fn();
    const renderer = mockedWebGLRenderer(setRenderTargetSpy).object();
    const originalTarget = new THREE.WebGLRenderTarget(64, 64);
    const newTarget = new THREE.WebGLRenderTarget(64, 64);
    renderer.setRenderTarget(originalTarget);

    const helper = new WebGLRendererStateHelper(renderer);

    helper.setRenderTarget(newTarget);
    expect(setRenderTargetSpy).toHaveBeenCalledWith(newTarget);

    helper.resetState();
    expect(setRenderTargetSpy).toHaveBeenCalledWith(originalTarget);

    function mockedWebGLRenderer(
      setRenderTargetSpy: THREE.WebGLRenderer['setRenderTarget']
    ): Mock<THREE.WebGLRenderer> {
      const rendererMock = new Mock<THREE.WebGLRenderer>();
      const state: { renderTarget: THREE.WebGLRenderTarget | null } = {
        renderTarget: null
      };
      rendererMock
        .setup(instance =>
          instance.setRenderTarget(
            It.Is<THREE.WebGLRenderTarget>(value => {
              state.renderTarget = value;
              return true;
            })
          )
        )
        .returns()
        .setup(instance => instance.getRenderTarget())
        .callback(() => state.renderTarget)
        .setup(instance => instance.setRenderTarget)
        .returns(setRenderTargetSpy);

      return rendererMock;
    }
  });

  test('set localClippingEnabled', () => {
    const renderer = mockedWebGLRenderer().object();
    renderer.localClippingEnabled = true;

    const helper = new WebGLRendererStateHelper(renderer);

    helper.localClippingEnabled = false;
    expect(renderer.localClippingEnabled).toBeFalsy();

    helper.resetState();
    expect(renderer.localClippingEnabled).toBeTruthy();

    function mockedWebGLRenderer(): Mock<THREE.WebGLRenderer> {
      const rendererMock = new Mock<THREE.WebGLRenderer>();
      const state = {
        localClippingEnabled: false
      };
      rendererMock
        .setup(
          instance =>
            (instance.localClippingEnabled = It.Is<boolean>(value => {
              state.localClippingEnabled = value;
              return true;
            }))
        )
        .returns(true)
        .setup(instance => instance.localClippingEnabled)
        .callback(() => state.localClippingEnabled);

      return rendererMock;
    }
  });

  test('set autoClear', () => {
    const renderer = mockedWebGLRenderer().object();
    renderer.autoClear = true;
    const helper = new WebGLRendererStateHelper(renderer);

    helper.autoClear = false;
    expect(renderer.autoClear).toBeFalsy();

    helper.resetState();
    expect(renderer.autoClear).toBeTruthy();

    function mockedWebGLRenderer(): Mock<THREE.WebGLRenderer> {
      const rendererMock = new Mock<THREE.WebGLRenderer>();
      const state = {
        autoClear: false
      };
      rendererMock
        .setup(
          instance =>
            (instance.autoClear = It.Is<boolean>(value => {
              state.autoClear = value;
              return true;
            }))
        )
        .returns(true)
        .setup(instance => instance.localClippingEnabled)
        .callback(() => state.autoClear);

      return rendererMock;
    }
  });

  test('setScissorTest()', () => {
    const setScissorTestSpy = vi.fn();
    const renderer = autoMockWebGLRenderer(new Mock<THREE.WebGLRenderer>())
      .setup(p => p.setScissorTest)
      .returns(setScissorTestSpy)
      .object();
    renderer.setScissorTest(true);
    const helper = new WebGLRendererStateHelper(renderer);

    helper.setScissorTest(false);
    expect(setScissorTestSpy).toHaveBeenCalledWith(false);

    helper.resetState();
    expect(setScissorTestSpy).toHaveBeenCalledWith(true);
  });

  test('setScissor()', () => {
    const setScissorSpy = vi.fn();
    const renderer = mockedWebGLRenderer(setScissorSpy).object();

    renderer.setScissor(0, 0, 64, 64);
    const helper = new WebGLRendererStateHelper(renderer);

    helper.setScissor(0, 0, 128, 128);
    expect(setScissorSpy).toHaveBeenCalledWith(0, 0, 128, 128);

    helper.resetState();
    expect(setScissorSpy).toHaveBeenCalledWith(new THREE.Vector4(0, 0, 64, 64));

    function mockedWebGLRenderer(setScissorSpy: ViMock<THREE.WebGLRenderer['setScissor']>): Mock<THREE.WebGLRenderer> {
      const rendererMock = new Mock<THREE.WebGLRenderer>();
      const state = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
      rendererMock
        .setup(instance => instance.setScissor)
        .returns(
          setScissorSpy.mockImplementation((x, y, width, height) => {
            if (typeof x === 'number') {
              state.x = x;
            }
            if (typeof y === 'number') {
              state.y = y;
            }
            if (typeof width === 'number') {
              state.width = width;
            }
            if (typeof height === 'number') {
              state.height = height;
            }
          })
        )
        .setup(instance => instance.getScissor(It.IsAny()))
        .callback(() => new THREE.Vector4(state.x, state.y, state.width, state.height));

      return rendererMock;
    }
  });

  test('setWebGLState', () => {
    const depthSetTestSpy = vi.fn();
    const depthSetMaskSpy = vi.fn();
    const renderer = autoMockWebGLRenderer(new Mock<THREE.WebGLRenderer>())
      .setup(instance => instance.state.buffers.depth.setTest)
      .returns(depthSetTestSpy)
      .setup(instance => instance.state.buffers.depth.setMask)
      .returns(depthSetMaskSpy)
      .setup(instance => instance.state.reset)
      .returns(vi.fn())
      .object();
    const helper = new WebGLRendererStateHelper(renderer);

    helper.setWebGLState(
      { buffers: { depth: { test: false, mask: false } } },
      { buffers: { depth: { test: true, mask: true } } }
    );
    expect(depthSetTestSpy).toHaveBeenCalledWith(false);
    expect(depthSetMaskSpy).toHaveBeenCalledWith(false);

    helper.resetState();
    expect(depthSetTestSpy).toHaveBeenCalledWith(true);
    expect(depthSetMaskSpy).toHaveBeenCalledWith(true);
  });
});
