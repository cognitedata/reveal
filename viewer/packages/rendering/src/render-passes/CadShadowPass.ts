/*!
 * Copyright 2026 Cognite AS
 */

import type {
  Camera,
  Mesh,
  PerspectiveCamera,
  RenderTargetOptions,
  ShaderMaterialParameters,
  Texture,
  WebGLRenderer
} from 'three';
import type { RenderPass } from '../RenderPass';
import {
  Color,
  GLSL3,
  LinearFilter,
  Matrix4,
  NoColorSpace,
  RawShaderMaterial,
  RedFormat,
  Scene,
  UnsignedByteType,
  WebGLRenderTarget
} from 'three';
import { CAD_LIGHT_WORLD, CAD_SHADOW_STRENGTH } from '../rendering/cadLighting';
import { cadShadowShaders } from '../rendering/shaders';
import { createFullScreenTriangleMesh } from '../utilities/renderUtilities';
import type { CadShadowMap } from '../render-pipeline-providers/types';

const CAD_TERMINATOR_FADE = 0.35;

const GL_PIXEL_PACK_BUFFER = 0x88eb;
const GL_STREAM_READ = 0x88e1;
const GL_RGBA = 0x1908;
const GL_UNSIGNED_BYTE = 0x1401;
const GL_SYNC_GPU_COMMANDS_COMPLETE = 0x9117;
const GL_TIMEOUT_EXPIRED = 0x911b;
const GL_WAIT_FAILED = 0x911d;

const FOCUS_READBACK_SLOTS = 3;

type FocusReadbackSlot = {
  buffer: WebGLBuffer | null;
  fence: WebGLSync | null;
  far: number;
};

type FocusProbe = {
  renderTarget: WebGLRenderTarget;
  material: RawShaderMaterial;
  mesh: Mesh;
  scene: Scene;
  pixel: Uint8Array;
  gl: WebGL2RenderingContext | null;
  slots: FocusReadbackSlot[];
  pending: number[];
  writeSlot: number;
  lastViewProjection: Matrix4;
  settled: boolean;
};

const FOCUS_SETTLED_FRACTION = 0.02;

export type CadShadowPassFactories = {
  createRenderTarget: (width: number, height: number, options: RenderTargetOptions) => WebGLRenderTarget;
  createMaterial: (parameters: ShaderMaterialParameters) => RawShaderMaterial;
  createFullScreenTriangleMesh: typeof createFullScreenTriangleMesh;
};

export const defaultCadShadowPassDependencies: CadShadowPassFactories = {
  createRenderTarget: (width, height, options) => new WebGLRenderTarget(width, height, options),
  createMaterial: parameters => new RawShaderMaterial(parameters),
  createFullScreenTriangleMesh
};

export class CadShadowPass implements RenderPass {
  private readonly _renderTarget: WebGLRenderTarget;
  private readonly _material: RawShaderMaterial;
  private readonly _mesh: Mesh;
  private readonly _scene: Scene;
  private readonly _shadowMap: CadShadowMap;
  private readonly _clearColor = new Color();
  private readonly _focusProbe: FocusProbe | undefined;
  private readonly _viewProjection = new Matrix4();
  private _focusDistance: number | undefined = undefined;
  private _disposed = false;

  constructor(
    cameraDepthTexture: Texture | null,
    shadowMap: CadShadowMap,
    terminatorFade: number = CAD_TERMINATOR_FADE,
    factories: Partial<CadShadowPassFactories> = {}
  ) {
    const {
      createRenderTarget,
      createMaterial,
      createFullScreenTriangleMesh: createMesh
    } = { ...defaultCadShadowPassDependencies, ...factories };

    this._shadowMap = shadowMap;

    this._focusProbe =
      shadowMap.setFocusDistance === undefined
        ? undefined
        : createFocusProbe(cameraDepthTexture, createRenderTarget, createMaterial, createMesh);

    this._renderTarget = createRenderTarget(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
      type: UnsignedByteType,
      format: RedFormat,
      magFilter: LinearFilter,
      minFilter: LinearFilter
    });

    this._renderTarget.texture.colorSpace = NoColorSpace;

    this._material = createMaterial({
      vertexShader: cadShadowShaders.vertex,
      fragmentShader: cadShadowShaders.fragment,
      uniforms: {
        tDepth: { value: cameraDepthTexture },
        tCadShadowMap: { value: shadowMap.depthTexture },
        inverseProjectionMatrix: { value: new Matrix4() },
        cadCameraMatrixWorld: { value: new Matrix4() },
        cadShadowMatrix: { value: new Matrix4() },
        cadShadowLightDirection: { value: CAD_LIGHT_WORLD },
        cadShadowTexelWorld: { value: 1 },
        cadShadowStableTexelWorld: { value: 1 },
        cadShadowDepthRange: { value: 1 },
        cadShadowStrength: { value: CAD_SHADOW_STRENGTH },
        cadShadowTerminatorFade: { value: terminatorFade }
      },
      glslVersion: GLSL3,
      depthTest: false,
      depthWrite: false
    });

    this._mesh = createMesh(this._material);

    this._scene = new Scene();
    this._scene.add(this._mesh);
  }

  public get texture(): Texture {
    return this._renderTarget.texture;
  }

  public setSize(width: number, height: number): void {
    this._renderTarget.setSize(width, height);
  }

  public render(renderer: WebGLRenderer, camera: Camera): void {
    const previousTarget = renderer.getRenderTarget();
    const previousAlpha = renderer.getClearAlpha();
    renderer.getClearColor(this._clearColor);

    const uniforms = this._material.uniforms;
    uniforms.inverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    uniforms.cadCameraMatrixWorld.value.copy(camera.matrixWorld);
    uniforms.cadShadowMatrix.value.copy(this._shadowMap.matrix);
    uniforms.cadShadowTexelWorld.value = this._shadowMap.texelWorldSize;
    uniforms.cadShadowStableTexelWorld.value = this._shadowMap.stableTexelWorldSize;
    uniforms.cadShadowDepthRange.value = this._shadowMap.depthRange;

    renderer.setClearColor('#FFFFFF', 1.0);
    renderer.setRenderTarget(this._renderTarget);
    renderer.clear();
    renderer.render(this._scene, camera);

    renderer.setClearColor(this._clearColor, previousAlpha);
    renderer.setRenderTarget(previousTarget);
  }

  public probeFocus(renderer: WebGLRenderer, camera: Camera): void {
    const probe = this._focusProbe;
    if (probe === undefined || this._disposed) {
      return;
    }
    const gl = renderer.getContext() as WebGL2RenderingContext;

    this.collectFocusReading(gl, probe);
    this.issueFocusReading(renderer, gl, probe, camera);

    this._shadowMap.setFocusDistance?.(this._focusDistance, probe.pending.length > 0);
  }

  public dispose(): void {
    this._disposed = true;
    this._renderTarget.dispose();
    this._mesh.geometry.dispose();
    this._material.dispose();
    const probe = this._focusProbe;
    if (probe !== undefined) {
      probe.renderTarget.dispose();
      probe.mesh.geometry.dispose();
      probe.material.dispose();
      const gl = probe.gl;
      if (gl !== null) {
        for (const slot of probe.slots) {
          if (slot.fence !== null) gl.deleteSync(slot.fence);
          if (slot.buffer !== null) gl.deleteBuffer(slot.buffer);
          slot.fence = null;
          slot.buffer = null;
        }
        probe.pending.length = 0;
      }
    }
  }

  private issueFocusReading(
    renderer: WebGLRenderer,
    gl: WebGL2RenderingContext,
    probe: FocusProbe,
    camera: Camera
  ): void {
    const slot = probe.slots[probe.writeSlot];
    if (slot.fence !== null) {
      return;
    }

    const viewProjection = this._viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    if (viewProjection.equals(probe.lastViewProjection)) {
      if (probe.settled) {
        return;
      }
    } else {
      probe.lastViewProjection.copy(viewProjection);
      probe.settled = false;
    }

    const far = (camera as PerspectiveCamera).far ?? 1;
    const uniforms = probe.material.uniforms;
    uniforms.inverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    uniforms.cameraFar.value = far;

    const previousTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(probe.renderTarget);
    renderer.render(probe.scene, camera);

    probe.gl = gl;
    if (slot.buffer === null) {
      slot.buffer = gl.createBuffer();
    }
    gl.bindBuffer(GL_PIXEL_PACK_BUFFER, slot.buffer);
    gl.bufferData(GL_PIXEL_PACK_BUFFER, probe.pixel.byteLength, GL_STREAM_READ);
    gl.readPixels(0, 0, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, 0);
    gl.bindBuffer(GL_PIXEL_PACK_BUFFER, null);
    slot.fence = gl.fenceSync(GL_SYNC_GPU_COMMANDS_COMPLETE, 0);
    slot.far = far;
    probe.pending.push(probe.writeSlot);
    probe.writeSlot = (probe.writeSlot + 1) % probe.slots.length;

    renderer.setRenderTarget(previousTarget);
  }

  private collectFocusReading(gl: WebGL2RenderingContext, probe: FocusProbe): void {
    if (probe.pending.length === 0) {
      return;
    }
    const slot = probe.slots[probe.pending[0]];
    if (slot.fence === null) {
      probe.pending.shift();
      return;
    }
    const status = gl.clientWaitSync(slot.fence, 0, 0);
    if (status === GL_TIMEOUT_EXPIRED) {
      return;
    }
    gl.deleteSync(slot.fence);
    slot.fence = null;
    probe.pending.shift();
    if (status === GL_WAIT_FAILED) {
      return;
    }

    gl.bindBuffer(GL_PIXEL_PACK_BUFFER, slot.buffer);
    gl.getBufferSubData(GL_PIXEL_PACK_BUFFER, 0, probe.pixel);
    gl.bindBuffer(GL_PIXEL_PACK_BUFFER, null);
    probe.settled = this.applyFocusReading(probe.pixel, slot.far);
  }

  private applyFocusReading(pixel: Uint8Array, far: number): boolean {
    if (pixel[3] === 0) {
      this._focusDistance = undefined;
      return true;
    }
    const normalized = (pixel[0] + pixel[1] / 255 + pixel[2] / 65025) / 255;
    const distance = normalized * far;
    if (!(distance > 0)) {
      return true;
    }
    const previous = this._focusDistance;
    this._focusDistance = distance;
    return previous !== undefined && Math.abs(distance - previous) <= previous * FOCUS_SETTLED_FRACTION;
  }
}

function createFocusProbe(
  cameraDepthTexture: Texture | null,
  createRenderTarget: CadShadowPassFactories['createRenderTarget'],
  createMaterial: CadShadowPassFactories['createMaterial'],
  createMesh: CadShadowPassFactories['createFullScreenTriangleMesh']
): FocusProbe {
  const renderTarget = createRenderTarget(1, 1, {
    depthBuffer: false,
    stencilBuffer: false,
    type: UnsignedByteType
  });
  renderTarget.texture.colorSpace = NoColorSpace;

  const material = createMaterial({
    vertexShader: cadShadowShaders.vertex,
    fragmentShader: cadShadowShaders.fragment,
    defines: { CAD_SHADOW_FOCUS_PROBE: '' },
    uniforms: {
      tDepth: { value: cameraDepthTexture },
      inverseProjectionMatrix: { value: new Matrix4() },
      cameraFar: { value: 1 }
    },
    glslVersion: GLSL3,
    depthTest: false,
    depthWrite: false
  });
  const mesh = createMesh(material);
  const scene = new Scene();
  scene.add(mesh);

  return {
    renderTarget,
    material,
    mesh,
    scene,
    pixel: new Uint8Array(4),
    gl: null,
    slots: Array.from({ length: FOCUS_READBACK_SLOTS }, () => ({ buffer: null, fence: null, far: 1 })),
    pending: [],
    writeSlot: 0,
    lastViewProjection: new Matrix4(),
    settled: false
  };
}
