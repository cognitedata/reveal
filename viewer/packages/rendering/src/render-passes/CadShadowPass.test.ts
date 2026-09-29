/*!
 * Copyright 2026 Cognite AS
 */

import type { Mesh, WebGLRenderer, RawShaderMaterial, WebGLRenderTarget } from 'three';
import { DepthTexture, Matrix4, PerspectiveCamera, Texture } from 'three';
import { It, Mock, Times } from 'moq.ts';
import { vi } from 'vitest';
import { CadShadowPass } from './CadShadowPass';
import type { CadShadowMap } from '../render-pipeline-providers/types';
import { CAD_LIGHT_WORLD, CAD_SHADOW_STRENGTH } from '../rendering/cadLighting';
import { autoMockWebGLRenderer } from '../../../../test-utilities';

describe(CadShadowPass.name, () => {
  const shadowMatrix = new Matrix4().makeTranslation(1, 2, 3);
  const cameraDepth = new DepthTexture(1, 1);
  const camera = new PerspectiveCamera(60, 1.5, 0.1, 100);
  camera.position.set(3, 4, 5);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  const shadowMap = new Mock<CadShadowMap>()
    .setup(p => p.matrix)
    .returns(shadowMatrix)
    .setup(p => p.depthTexture)
    .returns(new DepthTexture(1, 1))
    .setup(p => p.texelWorldSize)
    .returns(0.25)
    .setup(p => p.depthRange)
    .returns(12)
    .object();

  function passState(pass: CadShadowPass) {
    return pass as unknown as {
      _material: RawShaderMaterial;
      _mesh: Mesh;
      _renderTarget: WebGLRenderTarget;
    };
  }

  test('binds the camera depth, shadow map and lighting parameters', () => {
    const pass = new CadShadowPass(cameraDepth, shadowMap);
    const uniforms = passState(pass)._material.uniforms;

    expect(uniforms.tDepth.value).toBe(cameraDepth);
    expect(uniforms.tCadShadowMap.value).toBe(shadowMap.depthTexture);
    expect(uniforms.cadShadowLightDirection.value).toBe(CAD_LIGHT_WORLD);
    expect(uniforms.cadShadowStrength.value).toBe(CAD_SHADOW_STRENGTH);
    expect(uniforms.cadShadowTerminatorFade.value).toBe(0.35);

    const customFade = new CadShadowPass(cameraDepth, shadowMap, 0.2);
    expect(passState(customFade)._material.uniforms.cadShadowTerminatorFade.value).toBe(0.2);
  });

  test('exposes its render texture and resizes it', () => {
    const pass = new CadShadowPass(cameraDepth, shadowMap);
    const texture = pass.texture;

    expect(texture).toBeInstanceOf(Texture);

    pass.setSize(64, 32);

    expect(texture.width).toBe(64);
    expect(texture.height).toBe(32);
  });

  test('render draws into its own target and restores the renderer state', () => {
    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    const pass = new CadShadowPass(cameraDepth, shadowMap);

    pass.render(rendererMock.object(), camera);

    rendererMock.verify(p => p.setClearColor('#FFFFFF', 1), Times.Once());
    rendererMock.verify(p => p.clear(), Times.Once());
    rendererMock.verify(
      p => p.setRenderTarget(It.Is<WebGLRenderTarget | null>(target => target?.texture === pass.texture)),
      Times.Once()
    );
    rendererMock.verify(p => p.render(It.IsAny(), camera), Times.Once());
    rendererMock.verify(p => p.setRenderTarget(null), Times.Once());
    rendererMock.verify(p => p.setClearColor(It.IsAny(), 0), Times.Once());
  });

  test('render copies the camera and shadow map into the shader uniforms', () => {
    const pass = new CadShadowPass(cameraDepth, shadowMap);

    pass.render(autoMockWebGLRenderer(new Mock<WebGLRenderer>()).object(), camera);

    const uniforms = passState(pass)._material.uniforms;
    expect((uniforms.inverseProjectionMatrix.value as Matrix4).elements).toEqual(
      camera.projectionMatrixInverse.elements
    );
    expect((uniforms.cadCameraMatrixWorld.value as Matrix4).elements).toEqual(camera.matrixWorld.elements);
    expect((uniforms.cadShadowMatrix.value as Matrix4).elements).toEqual(shadowMatrix.elements);
    expect(uniforms.cadShadowMatrix.value).not.toBe(shadowMatrix);
    expect(uniforms.cadShadowTexelWorld.value).toBe(shadowMap.texelWorldSize);
    expect(uniforms.cadShadowDepthRange.value).toBe(shadowMap.depthRange);
  });

  test('dispose releases the render target, geometry and material', () => {
    const pass = new CadShadowPass(cameraDepth, shadowMap);
    const state = passState(pass);
    const renderTargetDispose = vi.spyOn(state._renderTarget, 'dispose');
    const geometryDispose = vi.spyOn(state._mesh.geometry, 'dispose');
    const materialDispose = vi.spyOn(state._material, 'dispose');

    pass.dispose();

    expect(renderTargetDispose).toHaveBeenCalledOnce();
    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
  });
});
