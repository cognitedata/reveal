/*!
 * Copyright 2026 Cognite AS
 */

import type { Material, Matrix3, WebGLRenderer } from 'three';
import {
  DepthTexture,
  Matrix4,
  Mesh,
  MirroredRepeatWrapping,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  Texture
} from 'three';
import { Mock } from 'moq.ts';
import { CustomObject } from '@reveal/utilities';
import { CustomObjectEffectMaterial } from './CustomObjectEffectMaterial';
import type { CadShadowMap } from '../render-pipeline-providers/types';

function customObject(mesh: Mesh, receiveShadow = false): CustomObject {
  const result = new CustomObject(mesh);
  result.receiveShadow = receiveShadow;
  return result;
}

describe(CustomObjectEffectMaterial.name, () => {
  const shadowMatrix = new Matrix4().makeTranslation(1, 2, 3);
  const shadowMap = new Mock<CadShadowMap>()
    .setup(p => p.enabled)
    .returns(true)
    .setup(p => p.matrix)
    .returns(shadowMatrix)
    .setup(p => p.depthTexture)
    .returns(new DepthTexture(1, 1))
    .setup(p => p.texelWorldSize)
    .returns(0.25)
    .setup(p => p.stableTexelWorldSize)
    .returns(0.25)
    .setup(p => p.depthRange)
    .returns(10)
    .object();
  const camera = new PerspectiveCamera();
  const renderer = new Mock<WebGLRenderer>().object();

  afterEach(() => {
    CustomObjectEffectMaterial.setFrameShadowMap(undefined);
  });

  function draw(material: CustomObjectEffectMaterial): void {
    material.onBeforeRender(renderer, new Scene(), camera, undefined, undefined, undefined);
  }

  function upFacingPlane(material: Material): Mesh {
    const mesh = new Mesh(new PlaneGeometry(12, 8), material);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  function tiledTexture(repeat = 4): Texture {
    const map = new Texture();
    map.repeat.set(repeat, repeat);
    return map;
  }

  test('applies the frame shadow map while drawing and clears it afterwards', () => {
    const map = new Texture();
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(4, 2);
    map.offset.set(0.1, 0.25);
    const material = new CustomObjectEffectMaterial('#88aa44', map);
    material.setReceivesShadow(true);
    CustomObjectEffectMaterial.setFrameShadowMap(shadowMap);

    draw(material);

    expect(material.uniforms.cadShadowApply.value).toBe(1);
    expect(material.uniforms.tCadShadowMap.value).toBe(shadowMap.depthTexture);
    expect(material.uniforms.cadShadowMatrix.value.elements).toEqual(shadowMatrix.elements);
    expect(material.uniforms.cadCameraMatrixWorld.value.elements).toEqual(camera.matrixWorld.elements);
    expect((material.uniforms.tDiffuseTransform.value as Matrix3).elements).toEqual([...map.matrix.elements]);

    CustomObjectEffectMaterial.setFrameShadowMap(undefined);
    draw(material);

    expect(material.uniforms.cadShadowApply.value).toBe(0);
    expect(material.uniforms.tCadShadowMap.value).toBeNull();
  });

  test('follows an animated texture offset without shadows', () => {
    const map = tiledTexture();
    const material = new CustomObjectEffectMaterial('#ffffff', map);
    draw(material);
    const before = [...(material.uniforms.tDiffuseTransform.value as Matrix3).elements];

    map.offset.set(0.3, 0.7);
    draw(material);

    const after = (material.uniforms.tDiffuseTransform.value as Matrix3).elements;
    expect(after).not.toEqual(before);
    expect(after).toEqual([...map.matrix.elements]);
  });

  test('follows the shadow flag only for objects that receive shadow', () => {
    const receiving = new CustomObjectEffectMaterial();
    const ignoring = new CustomObjectEffectMaterial();
    const owner = {};
    CustomObjectEffectMaterial.registerEffect(owner, upFacingPlane(receiving), receiving, undefined, false, true);
    CustomObjectEffectMaterial.registerEffect(owner, upFacingPlane(ignoring), ignoring, undefined, false, false);

    expect(receiving.receivesShadow).toBe(false);

    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, true);
    expect(receiving.receivesShadow).toBe(true);
    expect(ignoring.receivesShadow).toBe(false);

    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, false);
    expect(receiving.receivesShadow).toBe(false);

    CustomObjectEffectMaterial.releaseOwner(owner);
  });

  test('keeps the texture variation the material set through adoption and release', () => {
    const material = new CustomObjectEffectMaterial('#ffffff', tiledTexture());
    const dispose = vi.spyOn(material, 'dispose');
    const mesh = upFacingPlane(material);
    const owner = {};
    const object = customObject(mesh);

    material.setTextureVariation('hexTiling');
    expect(material.textureVariation).toBe('hexTiling');
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeDefined();

    CustomObjectEffectMaterial.registerEffect(owner, mesh, material, undefined, false, false);
    expect(material.textureVariation).toBe('hexTiling');

    material.setTextureVariation('none');
    expect(material.textureVariation).toBe('none');

    CustomObjectEffectMaterial.releaseEffects(owner, [object]);
    expect(mesh.material).toBe(material);
    expect(material.textureVariation).toBe('none');
    expect(dispose).not.toHaveBeenCalled();
  });

  test('compiles only the chosen texture variation technique', () => {
    const material = new CustomObjectEffectMaterial('#ffffff', tiledTexture());

    material.setTextureVariation('waterTiling');
    expect(material.textureVariation).toBe('waterTiling');
    expect(material.defines.WATER_TILING_TEXTURE_VARIATION).toBeDefined();
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeUndefined();

    material.setTextureVariation('hexTiling');
    expect(material.textureVariation).toBe('hexTiling');
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeDefined();
    expect(material.defines.WATER_TILING_TEXTURE_VARIATION).toBeUndefined();

    material.setTextureVariation('none');
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeUndefined();
    expect(material.defines.WATER_TILING_TEXTURE_VARIATION).toBeUndefined();
  });

  test('stays off without a texture and starts once a texture is set', () => {
    const material = new CustomObjectEffectMaterial('#ffffff');

    material.setTextureVariation('waterTiling');
    expect(material.textureVariation).toBe('none');

    material.setMap(tiledTexture());
    expect(material.textureVariation).toBe('waterTiling');

    material.setMap(null);
    expect(material.textureVariation).toBe('none');
  });

  test('hex tiling repeats a tiled map and mirrors a stretched map', () => {
    const repeated = tiledTexture(4);
    new CustomObjectEffectMaterial('#ffffff', repeated).setTextureVariation('hexTiling');

    expect(repeated.wrapS).toBe(RepeatWrapping);
    expect(repeated.wrapT).toBe(RepeatWrapping);

    const stretched = tiledTexture(1);
    new CustomObjectEffectMaterial('#ffffff', stretched).setTextureVariation('hexTiling');

    expect(stretched.wrapS).toBe(MirroredRepeatWrapping);
    expect(stretched.wrapT).toBe(MirroredRepeatWrapping);
  });

  test('water tiling never mirrors, so waves keep their direction', () => {
    const stretched = tiledTexture(1);
    new CustomObjectEffectMaterial('#ffffff', stretched).setTextureVariation('waterTiling');

    expect(stretched.wrapS).toBe(RepeatWrapping);
    expect(stretched.wrapT).toBe(RepeatWrapping);
  });
});
