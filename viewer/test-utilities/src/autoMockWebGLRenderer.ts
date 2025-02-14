/*!
 * Copyright 2024 Cognite AS
 */
import { It, Mock } from 'moq.ts';
import {
  Color,
  Vector2,
  Vector4,
  type WebGLCapabilities,
  // type WebGLColorBuffer,
  // type WebGLDepthBuffer,
  type WebGLExtensions,
  type WebGLInfo,
  type WebGLRenderLists,
  type WebGLRenderer,
  type WebGLState
  // type WebGLStencilBuffer
} from 'three';

export type AutoMockOverrides = {
  canvas?: HTMLCanvasElement;
};

export function autoMockWebGLRenderer(
  renderer: Mock<WebGLRenderer>,
  overrides?: AutoMockOverrides
): Mock<WebGLRenderer> {
  const webglInfo = autoMockGLInfo();
  const webglContext = autoMockGLContext();
  const renderLists = autoMockRenderLists();
  const webglState = autoMockGLState();
  const webGLCapabilities = autoMockGLCapabilities();

  autoMockGLRenderer(renderer, overrides, webglInfo, webglContext, renderLists, webglState, webGLCapabilities);

  return renderer;
}
function autoMockGLRenderer(
  renderer: Mock<WebGLRenderer>,
  overrides: AutoMockOverrides | undefined,
  webglInfo: Mock<WebGLInfo>,
  webglContext: Mock<WebGL2RenderingContext>,
  renderLists: Mock<WebGLRenderLists>,
  webglState: Mock<WebGLState>,
  webGLCapabilities: Mock<WebGLCapabilities>
) {
  renderer.setup(instance => instance.domElement).returns(overrides?.canvas ?? document.createElement('canvas'));
  renderer.setup(instance => instance.getPixelRatio()).returns(1);
  renderer.setup(instance => instance.setPixelRatio(It.IsAny())).returns();
  renderer.setup(instance => instance.info).returns(webglInfo.object());
  renderer.setup(instance => instance.getContext()).returns(webglContext.object());
  renderer.setup(instance => instance.getClearColor(It.IsAny())).returns(new Color());
  renderer.setup(instance => instance.getClearAlpha()).returns(0);
  renderer.setup(instance => instance.setClearColor(It.IsAny(), It.IsAny())).returns();
  renderer.setup(instance => instance.getSize(It.IsAny())).returns(new Vector2());
  renderer.setup(instance => instance.getDrawingBufferSize(It.IsAny())).returns(new Vector2());
  renderer.setup(instance => instance.getRenderTarget()).returns(null);
  renderer.setup(instance => instance.setRenderTarget(It.IsAny())).returns();
  renderer.setup(instance => instance.clear()).returns();
  renderer.setup(instance => instance.dispose()).returns();
  renderer.setup(instance => instance.render(It.IsAny(), It.IsAny())).returns();
  renderer.setup(instance => instance.getScissor(It.IsAny())).returns(new Vector4());
  renderer.setup(instance => instance.setScissor(It.IsAny())).returns();
  renderer.setup(instance => instance.getScissorTest()).returns(true);
  renderer.setup(instance => instance.setScissorTest(It.IsAny())).returns();
  renderer.setup(instance => instance.setSize(It.IsAny(), It.IsAny())).returns();
  renderer
    .setup(instance =>
      instance.readRenderTargetPixelsAsync(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())
    )
    .returns(Promise.resolve(new Uint8Array(4)));
  renderer.setup(instance => instance.renderLists).returns(renderLists.object());
  renderer.setup(instance => instance.state).returns(webglState.object());
  renderer.setup(instance => instance.extensions).returns(new Mock<WebGLExtensions>().object());
  renderer.setup(instance => instance.capabilities).returns(webGLCapabilities.object());
}

function autoMockGLCapabilities() {
  const webGLCapabilities = new Mock<WebGLCapabilities>();
  webGLCapabilities.setup(instance => instance.isWebGL2).returns(true);
  return webGLCapabilities;
}

function autoMockGLState() {
  const depthBuffer = new Mock<{ setTest: (depthTest: boolean) => void; setMask: (depthMask: boolean) => void }>();
  depthBuffer
    .setup(instance => instance.setTest(It.IsAny()))
    .returns()
    .setup(instance => instance.setMask(It.IsAny()))
    .returns();

  const webglState = new Mock<WebGLState>();

  webglState
    .setup(instance => instance.buffers)
    .returns({
      color: new Mock<any>().object() as any,
      depth: depthBuffer.object() as any,
      stencil: new Mock<any>().object() as any
    })
    .setup(instance => instance.reset())
    .returns();

  return webglState;
}

function autoMockRenderLists() {
  const renderLists = new Mock<WebGLRenderLists>();
  renderLists.setup(instance => instance.dispose()).returns();
  return renderLists;
}

function autoMockGLContext() {
  const webglContext = new Mock<WebGL2RenderingContext>();
  webglContext.setup(instance => instance.getParameter(It.IsAny())).returns([0, 0]);
  webglContext.setup(instance => instance.createBuffer()).returns(new Mock<WebGLBuffer>().object());
  webglContext.setup(instance => instance.deleteBuffer(It.IsAny())).returns();
  webglContext.setup(instance => instance.bindBuffer(It.IsAny(), It.IsAny())).returns();
  webglContext
    .setup(instance =>
      instance.readPixels(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())
    )
    .returns();
  webglContext.setup(instance => instance.bufferData(It.IsAny(), It.IsAny(), It.IsAny())).returns();
  webglContext.setup(instance => instance.fenceSync(It.IsAny(), It.IsAny())).returns(new Mock<WebGLSync>().object());
  webglContext.setup(instance => instance.flush()).returns();
  webglContext.setup(instance => instance.deleteSync(It.IsAny())).returns();
  webglContext.setup(instance => instance.clientWaitSync(It.IsAny(), It.IsAny(), It.IsAny())).returns(0);
  webglContext
    .setup(instance => instance.getBufferSubData(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
    .returns();
  return webglContext;
}

function autoMockGLInfo() {
  const webglInfo = new Mock<WebGLInfo>();
  webglInfo.setup(instance => instance.autoReset).returns(true);
  webglInfo.setup(instance => instance.render).returns({ calls: 0, frame: 0, lines: 0, points: 0, triangles: 0 });
  webglInfo.setup(instance => instance.reset()).returns();
  return webglInfo;
}
