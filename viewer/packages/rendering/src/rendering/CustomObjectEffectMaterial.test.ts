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

  test('applies the frame shadow map while drawing and clears it afterwards', () => {
    const map = new Texture();
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(4, 2);
    map.offset.set(0.1, 0.25);
    const receiver = new CustomObjectEffectMaterial('#88aa44', map);
    receiver.setReceivesShadow(true);
    CustomObjectEffectMaterial.setFrameShadowMap(shadowMap);

    draw(receiver);

    expect(receiver.uniforms.cadShadowApply.value).toBe(1);
    expect(receiver.uniforms.tCadShadowMap.value).toBe(shadowMap.depthTexture);
    expect(receiver.uniforms.cadShadowMatrix.value.elements).toEqual(shadowMatrix.elements);
    expect(receiver.uniforms.cadCameraMatrixWorld.value.elements).toEqual(camera.matrixWorld.elements);
    expect((receiver.uniforms.tReceiverTransform.value as Matrix3).elements).toEqual([...map.matrix.elements]);

    CustomObjectEffectMaterial.setFrameShadowMap(undefined);
    draw(receiver);

    expect(receiver.uniforms.cadShadowApply.value).toBe(0);
    expect(receiver.uniforms.tCadShadowMap.value).toBeNull();
  });

  test('follows the shadow flag only for objects that receive shadow', () => {
    const receiving = new CustomObjectEffectMaterial();
    const ignoring = new CustomObjectEffectMaterial();
    const owner = {};
    CustomObjectEffectMaterial.registerReceiver(owner, upFacingPlane(receiving), receiving, undefined, false, true);
    CustomObjectEffectMaterial.registerReceiver(owner, upFacingPlane(ignoring), ignoring, undefined, false, false);

    expect(receiving.receivesShadow).toBe(false);

    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, true);
    expect(receiving.receivesShadow).toBe(true);
    expect(ignoring.receivesShadow).toBe(false);

    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, false);
    expect(receiving.receivesShadow).toBe(false);

    CustomObjectEffectMaterial.releaseOwner(owner);
  });

  test('keeps hex tiling that the material set through adoption and release', () => {
    const material = new CustomObjectEffectMaterial('#ffffff', new Texture());
    const dispose = vi.spyOn(material, 'dispose');
    const mesh = upFacingPlane(material);
    const owner = {};
    const object = customObject(mesh);

    material.setTextureVariation(true);
    expect(material.textureVariation).toBe(true);
    expect(material.defines.HEX_TILING_TEXTURE_VARIATION).toBeDefined();

    CustomObjectEffectMaterial.registerReceiver(owner, mesh, material, undefined, false, false);
    expect(material.textureVariation).toBe(true);

    material.setTextureVariation(false);
    expect(material.textureVariation).toBe(false);

    CustomObjectEffectMaterial.releaseReceivers(owner, [object]);
    expect(mesh.material).toBe(material);
    expect(material.textureVariation).toBe(false);
    expect(dispose).not.toHaveBeenCalled();
  });

  test('repeats a tiled map and mirrors a stretched map', () => {
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
