import { It, Mock } from 'moq.ts';
import {
  Color,
  Vector2,
  Vector4,
  type WebGLCapabilities,
  type WebGLColorBuffer,
  type WebGLDepthBuffer,
  type WebGLExtensions,
  type WebGLInfo,
  type WebGLRenderLists,
  type WebGLRenderer,
  type WebGLState,
  type WebGLStencilBuffer
} from 'three';

export type AutoMockOverrides = {
  canvas?: HTMLCanvasElement;
};

export function autoMockWebGLRenderer(
  renderer: Mock<WebGLRenderer>,
  overrides?: AutoMockOverrides
): Mock<WebGLRenderer> {
  const webglInfo = new Mock<WebGLInfo>();
  webglInfo.setup(instance => instance.autoReset).returns(true);
  webglInfo.setup(instance => instance.render).returns({ calls: 0, frame: 0, lines: 0, points: 0, triangles: 0 });
  webglInfo.setup(instance => instance.reset()).returns();

  const sync = new Mock<WebGLSync>();

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
  webglContext.setup(instance => instance.fenceSync(It.IsAny(), It.IsAny())).returns(sync.object());
  webglContext.setup(instance => instance.flush()).returns();
  webglContext.setup(instance => instance.deleteSync(It.IsAny())).returns();
  webglContext.setup(instance => instance.clientWaitSync(It.IsAny(), It.IsAny(), It.IsAny())).returns(0);
  webglContext
    .setup(instance => instance.getBufferSubData(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny()))
    .returns();

  const renderLists = new Mock<WebGLRenderLists>();
  renderLists.setup(instance => instance.dispose()).returns();

  const colorBuffer = new Mock<WebGLColorBuffer>();
  const depthBuffer = new Mock<WebGLDepthBuffer>();
  depthBuffer.setup(instance => instance.setTest(It.IsAny())).returns();
  depthBuffer.setup(instance => instance.setMask(It.IsAny())).returns();
  const stencilBuffer = new Mock<WebGLStencilBuffer>();

  const webglState = new Mock<WebGLState>();
  webglState
    .setup(instance => instance.buffers)
    .returns({
      color: colorBuffer.object(),
      depth: depthBuffer.object(),
      stencil: stencilBuffer.object()
    })
    .setup(instance => instance.reset())
    .returns();

  const webGLCapabilities = new Mock<WebGLCapabilities>();
  webGLCapabilities.setup(instance => instance.isWebGL2).returns(true);

  const webglExtensions = new Mock<WebGLExtensions>();

  const canvasCSSStyleDeclaration = new Mock<CSSStyleDeclaration>();
  canvasCSSStyleDeclaration.setup(instance => (instance.width = It.IsAny())).callback(() => true);
  canvasCSSStyleDeclaration.setup(instance => (instance.height = It.IsAny())).callback(() => true);
  canvasCSSStyleDeclaration.setup(instance => (instance.minWidth = It.IsAny())).callback(() => true);
  canvasCSSStyleDeclaration.setup(instance => (instance.minHeight = It.IsAny())).callback(() => true);
  canvasCSSStyleDeclaration.setup(instance => (instance.maxWidth = It.IsAny())).callback(() => true);
  canvasCSSStyleDeclaration.setup(instance => (instance.maxHeight = It.IsAny())).callback(() => true);

  const canvas = new Mock<HTMLCanvasElement>();
  canvas.setup(instance => instance.style).returns(canvasCSSStyleDeclaration.object());
  canvas.setup(instance => instance.appendChild(It.IsAny())).returns({});

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
  renderer.setup(instance => instance.renderLists).returns(renderLists.object());
  renderer.setup(instance => instance.state).returns(webglState.object());
  renderer.setup(instance => instance.extensions).returns(webglExtensions.object());
  renderer.setup(instance => instance.capabilities).returns(webGLCapabilities.object());
  return renderer;
}
