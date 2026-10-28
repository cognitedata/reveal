/*!
 * Copyright 2026 Cognite AS
 */

import type { Matrix3, WebGLRenderer } from 'three';
import {
  DepthTexture,
  Matrix4,
  MirroredRepeatWrapping,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  Texture
} from 'three';
import { Mock } from 'moq.ts';
import { CustomObjectEffectMaterial } from './CustomObjectEffectMaterial';
import type { CadShadowMap } from '../render-pipeline-providers/types';

describe(CustomObjectEffectMaterial.name, () => {
  const shadowMatrix = new Matrix4().makeTranslation(1, 2, 3);
  const shadowMap = createShadowMap(shadowMatrix);
  const camera = new PerspectiveCamera();
  const renderer = new Mock<WebGLRenderer>().object();

  function draw(material: CustomObjectEffectMaterial, scene: Scene): void {
    material.onBeforeRender(renderer, scene, camera, undefined, undefined, undefined);
  }

  test('includes the frame shadow map of its scene while drawing and leaves it out afterwards', () => {
    const scene = new Scene();
    const texture = new Texture();
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 2);
    texture.offset.set(0.1, 0.25);
    const material = new CustomObjectEffectMaterial('#88aa44', texture);
    material.setReceivesShadow(true);
    CustomObjectEffectMaterial.setFrameShadowMap(scene, shadowMap);

    draw(material, scene);

    expect(material.defines.CAD_SHADOW).toBeDefined();
    expect(material.uniforms.tCadShadowMap.value).toBe(shadowMap.depthTexture);
    expect(material.uniforms.cadShadowMatrix.value.elements).toEqual(shadowMatrix.elements);
    expect(material.uniforms.cadCameraMatrixWorld.value.elements).toEqual(camera.matrixWorld.elements);
    expect((material.uniforms.tDiffuseTransform.value as Matrix3).elements).toEqual([...texture.matrix.elements]);

    CustomObjectEffectMaterial.setFrameShadowMap(scene, undefined);
    draw(material, scene);

    expect(material.defines.CAD_SHADOW).toBeUndefined();
    expect(material.uniforms.tCadShadowMap.value).toBeNull();
    expect(material.receivesShadow).toBe(true);
  });

  test('reads the shadow map of the scene it is drawn in, not the one of another viewer', () => {
    const sceneWithShadows = new Scene();
    const sceneWithoutShadows = new Scene();
    const material = new CustomObjectEffectMaterial();
    material.setReceivesShadow(true);
    CustomObjectEffectMaterial.setFrameShadowMap(sceneWithShadows, shadowMap);

    draw(material, sceneWithShadows);
    expect(material.defines.CAD_SHADOW).toBeDefined();

    draw(material, sceneWithoutShadows);
    expect(material.defines.CAD_SHADOW).toBeUndefined();
    expect(material.uniforms.tCadShadowMap.value).toBeNull();
  });

  test('starts with every effect off', () => {
    const material = new CustomObjectEffectMaterial('#ffffff', new Texture());
    expect(material.receivesShadow).toBe(false);
    expect(material.textureVariationEnabled).toBe(false);
    expect(material.defines.CAD_SHADOW).toBeUndefined();
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeUndefined();
  });

  test('applies a shadow request or drop on the next draw', () => {
    const scene = new Scene();
    const material = new CustomObjectEffectMaterial();
    CustomObjectEffectMaterial.setFrameShadowMap(scene, shadowMap);

    material.setReceivesShadow(true);
    expect(material.receivesShadow).toBe(true);
    draw(material, scene);
    expect(material.defines.CAD_SHADOW).toBeDefined();

    material.setReceivesShadow(false);
    expect(material.receivesShadow).toBe(false);
    draw(material, scene);
    expect(material.defines.CAD_SHADOW).toBeUndefined();
    expect(material.uniforms.tCadShadowMap.value).toBeNull();
  });

  test('keeps the request but leaves the shadow out of the shader while the viewer has no shadow map', () => {
    const scene = new Scene();
    const material = new CustomObjectEffectMaterial();
    material.setReceivesShadow(true);

    draw(material, scene);

    expect(material.receivesShadow).toBe(true);
    expect(material.defines.CAD_SHADOW).toBeUndefined();
    expect(material.uniforms.tCadShadowMap.value).toBeNull();
  });

  test('draws no shadow on a material that did not request it, even with a frame shadow map', () => {
    const scene = new Scene();
    const material = new CustomObjectEffectMaterial();
    CustomObjectEffectMaterial.setFrameShadowMap(scene, shadowMap);

    draw(material, scene);

    expect(material.defines.CAD_SHADOW).toBeUndefined();
    expect(material.uniforms.tCadShadowMap.value).toBeNull();
  });

  test('follows changes to the texture transform on each draw, with or without shadows', () => {
    const scene = new Scene();
    const texture = new Texture();
    const material = new CustomObjectEffectMaterial('#ffffff', texture);

    texture.repeat.set(8, 8);
    texture.offset.set(0.5, 0.25);
    draw(material, scene);

    expect(material.defines.CAD_SHADOW).toBeUndefined();
    expect((material.uniforms.tDiffuseTransform.value as Matrix3).elements).toEqual([...texture.matrix.elements]);
  });

  test('keeps hex tiling independent of the shadow request', () => {
    const scene = new Scene();
    const material = new CustomObjectEffectMaterial('#ffffff', new Texture());
    material.setTextureVariation(true);
    expect(material.textureVariationEnabled).toBe(true);
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeDefined();

    CustomObjectEffectMaterial.setFrameShadowMap(scene, shadowMap);
    material.setReceivesShadow(true);
    draw(material, scene);
    material.setReceivesShadow(false);
    draw(material, scene);
    expect(material.textureVariationEnabled).toBe(true);
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeDefined();

    material.setTextureVariation(false);
    expect(material.textureVariationEnabled).toBe(false);
    expect(material.receivesShadow).toBe(false);
  });

  test('keeps a texture variation requested before the texture and applies it once the texture is set', () => {
    const material = new CustomObjectEffectMaterial();
    material.setTextureVariation(true);
    expect(material.textureVariationEnabled).toBe(true);
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeUndefined();

    const texture = new Texture();
    texture.repeat.set(4, 4);
    material.setDiffuseTexture(texture);

    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeDefined();
    expect(texture.wrapS).toBe(RepeatWrapping);
    expect(texture.wrapT).toBe(RepeatWrapping);
  });

  test('keeps the texture variation request while the texture is cleared and fits it to a new texture', () => {
    const tiled = new Texture();
    tiled.repeat.set(4, 4);
    const material = new CustomObjectEffectMaterial('#ffffff', tiled);
    material.setTextureVariation(true);

    material.setDiffuseTexture(null);
    expect(material.textureVariationEnabled).toBe(true);
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeUndefined();

    const stretched = new Texture();
    stretched.repeat.set(1, 1);
    material.setDiffuseTexture(stretched);
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeDefined();
    expect(stretched.wrapS).toBe(MirroredRepeatWrapping);
    expect(stretched.wrapT).toBe(MirroredRepeatWrapping);
  });

  test('keeps the deprecated setMap working as setDiffuseTexture', () => {
    const material = new CustomObjectEffectMaterial();
    const texture = new Texture();

    material.setMap(texture);
    expect(material.uniforms.tDiffuse.value).toBe(texture);
    expect(material.defines.USE_DIFFUSE_TEXTURE).toBeDefined();

    material.setMap(null);
    expect(material.uniforms.tDiffuse.value).toBeNull();
    expect(material.defines.USE_DIFFUSE_TEXTURE).toBeUndefined();
  });

  test('repeats a tiled texture and mirrors a stretched texture', () => {
    const repeated = new Texture();
    repeated.repeat.set(4, 4);
    new CustomObjectEffectMaterial('#ffffff', repeated).setTextureVariation(true);

    expect(repeated.wrapS).toBe(RepeatWrapping);
    expect(repeated.wrapT).toBe(RepeatWrapping);

    const stretched = new Texture();
    stretched.repeat.set(1, 1);
    new CustomObjectEffectMaterial('#ffffff', stretched).setTextureVariation(true);

    expect(stretched.wrapS).toBe(MirroredRepeatWrapping);
    expect(stretched.wrapT).toBe(MirroredRepeatWrapping);
  });
});

function createShadowMap(matrix: Matrix4): CadShadowMap {
  return new Mock<CadShadowMap>()
    .setup(p => p.enabled)
    .returns(true)
    .setup(p => p.matrix)
    .returns(matrix)
    .setup(p => p.depthTexture)
    .returns(new DepthTexture(1, 1))
    .setup(p => p.texelWorldSize)
    .returns(0.25)
    .setup(p => p.stableTexelWorldSize)
    .returns(0.25)
    .setup(p => p.depthRange)
    .returns(10)
    .object();
}
