/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { WebGLRendererStateHelper } from './WebGLRendererStateHelper';

import { jest } from '@jest/globals';
import { It, Mock } from 'moq.ts';
import { populateWebGLRendererMock } from '../../../test-utilities';

describe('WebGLRendererStateHelper', () => {
  let renderer: THREE.WebGLRenderer;

  beforeEach(() => {
    renderer = populateWebGLRendererMock(new Mock<THREE.WebGLRenderer>()).object();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('setClearColor()', () => {
    const renderer = mockedWebGLRenderer().object();
    renderer.setClearColor('#AABBCC', 0.5);
    const originalColor = renderer.getClearColor(new THREE.Color());
    const originalAlpha = renderer.getClearAlpha();

    const helper = new WebGLRendererStateHelper(renderer);
    const setClearColorSpy = jest.spyOn(renderer, 'setClearColor');
    const color = new THREE.Color('#112233');

    helper.setClearColor(color, 0.8);
    expect(setClearColorSpy).toHaveBeenCalledWith(color, 0.8);

    helper.resetState();
    expect(setClearColorSpy).toHaveBeenCalledWith(originalColor, originalAlpha);

    function mockedWebGLRenderer(): Mock<THREE.WebGLRenderer> {
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
        .returns(state.clearAlpha);

      return rendererMock;
    }
  });

  test('setSize()', () => {
    const renderer = mockedWebGLRenderer().object();
    renderer.setSize(128, 256);

    const helper = new WebGLRendererStateHelper(renderer);
    const setSizeSpy = jest.spyOn(renderer, 'setSize');

    helper.setSize(640, 480);
    expect(setSizeSpy).toHaveBeenCalledWith(640, 480);

    helper.resetState();
    expect(setSizeSpy).toHaveBeenCalledWith(128, 256);

    function mockedWebGLRenderer(): Mock<THREE.WebGLRenderer> {
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
        .callback(() => new THREE.Vector2(state.width, state.height));

      return rendererMock;
    }
  });

  test('setRenderTarget()', () => {
    const renderer = mockedWebGLRenderer().object();
    const originalTarget = new THREE.WebGLRenderTarget(64, 64);
    const newTarget = new THREE.WebGLRenderTarget(64, 64);
    renderer.setRenderTarget(originalTarget);

    const helper = new WebGLRendererStateHelper(renderer);
    const setRenderTargetSpy = jest.spyOn(renderer, 'setRenderTarget');

    helper.setRenderTarget(newTarget);
    expect(setRenderTargetSpy).toHaveBeenCalledWith(newTarget);

    helper.resetState();
    expect(setRenderTargetSpy).toHaveBeenCalledWith(originalTarget);

    function mockedWebGLRenderer(): Mock<THREE.WebGLRenderer> {
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
        .callback(() => state.renderTarget);

      return rendererMock;
    }
  });

  test('set localClippingEnabled', () => {
    const renderer = mockedWebGLRenderer().object();
    renderer.localClippingEnabled = true;

    const helper = new WebGLRendererStateHelper(renderer);

    helper.localClippingEnabled = false;
    expect(renderer.localClippingEnabled).toBeFalse();

    helper.resetState();
    expect(renderer.localClippingEnabled).toBeTrue();

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
    expect(renderer.autoClear).toBeFalse();

    helper.resetState();
    expect(renderer.autoClear).toBeTrue();

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
    renderer.setScissorTest(true);
    const helper = new WebGLRendererStateHelper(renderer);
    const setScissorTestSpy = jest.spyOn(renderer, 'setScissorTest');

    helper.setScissorTest(false);
    expect(setScissorTestSpy).toHaveBeenCalledWith(false);

    helper.resetState();
    expect(setScissorTestSpy).toHaveBeenCalledWith(true);
  });

  test('setScissor()', () => {
    const renderer = mockedWebGLRenderer().object();

    renderer.setScissor(0, 0, 64, 64);
    const helper = new WebGLRendererStateHelper(renderer);
    const setScissorSpy = jest.spyOn(renderer, 'setScissor');

    helper.setScissor(0, 0, 128, 128);
    expect(setScissorSpy).toHaveBeenCalledWith(0, 0, 128, 128);

    helper.resetState();
    expect(setScissorSpy).toHaveBeenCalledWith(new THREE.Vector4(0, 0, 64, 64));

    function mockedWebGLRenderer(): Mock<THREE.WebGLRenderer> {
      const rendererMock = new Mock<THREE.WebGLRenderer>();
      const state = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
      rendererMock
        .setup(instance =>
          instance.setScissor(
            It.Is<number>(x => {
              state.x = x;
              return true;
            }),
            It.Is<number>(y => {
              state.y = y;
              return true;
            }),
            It.Is<number>(width => {
              state.width = width;
              return true;
            }),
            It.Is<number>(height => {
              state.height = height;
              return true;
            })
          )
        )
        .returns()
        .setup(instance => instance.getScissor(It.IsAny()))
        .callback(() => new THREE.Vector4(state.x, state.y, state.width, state.height));

      return rendererMock;
    }
  });

  test('setWebGLState', () => {
    const helper = new WebGLRendererStateHelper(renderer);
    const depthSetTestSpy = jest.spyOn(renderer.state.buffers.depth, 'setTest');
    const depthSetMaskSpy = jest.spyOn(renderer.state.buffers.depth, 'setMask');

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
