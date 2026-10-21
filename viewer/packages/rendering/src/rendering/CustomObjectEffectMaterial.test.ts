/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGLRenderer, Matrix3 } from 'three';
import {
  DepthTexture,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MirroredRepeatWrapping,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  Texture
} from 'three';
import { assert } from 'vitest';
import { Mock } from 'moq.ts';
import type { ICustomObject } from '@reveal/utilities';
import { CustomObjectEffectMaterial } from './CustomObjectEffectMaterial';
import type { CadShadowMap } from '../render-pipeline-providers/types';

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

  function upFacingPlane(material: MeshBasicMaterial): Mesh {
    const mesh = new Mesh(new PlaneGeometry(12, 8), material);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  function customObject(mesh: Mesh, receiveShadow = true): ICustomObject {
    return new Mock<ICustomObject>()
      .setup(p => p.object)
      .returns(mesh)
      .setup(p => p.receiveShadow)
      .returns(receiveShadow)
      .object();
  }

  test('applies the frame shadow map while drawing and clears it afterwards', () => {
    const map = new Texture();
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(4, 2);
    map.offset.set(0.1, 0.25);
    const receiver = new CustomObjectEffectMaterial('#88aa44', map);
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

  test('installs the effect on an up-facing plane only while shadows are visible', () => {
    const map = new Texture();
    map.repeat.set(3, 5);
    const source = new MeshBasicMaterial({ color: '#446688', map });
    const mesh = upFacingPlane(source);
    const owner = {};
    CustomObjectEffectMaterial.adoptReceivers(owner, [customObject(mesh)], false);

    expect(mesh.material).toBe(source);

    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, true);
    const receiver = mesh.material;
    assert(receiver instanceof CustomObjectEffectMaterial);
    expect(receiver.uniforms.tReceiver.value).toBe(map);
    expect(receiver.uniforms.receiverColor.value).toEqual(source.color);

    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, false);
    expect(mesh.material).toBe(source);

    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, true);
    expect(mesh.material).toBe(receiver);
  });

  test('keeps hex tiling on a textured plane while shadows are off', () => {
    const source = new MeshBasicMaterial({ map: new Texture() });
    const mesh = upFacingPlane(source);
    const owner = {};
    const object = customObject(mesh, false);
    CustomObjectEffectMaterial.adoptReceivers(owner, [object], false, true);

    const receiver = mesh.material;
    assert(receiver instanceof CustomObjectEffectMaterial);
    expect(receiver.textureVariation).toBe(true);
    expect(receiver.defines.HEX_TILING_TEXTURE_VARIATION).toBeDefined();

    CustomObjectEffectMaterial.setFrameShadowMap(shadowMap);
    draw(receiver);
    expect(receiver.uniforms.cadShadowApply.value).toBe(0);

    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, true);
    expect(mesh.material).toBe(receiver);
    CustomObjectEffectMaterial.setShadowMaterialsVisible(owner, false);
    expect(mesh.material).toBe(receiver);

    CustomObjectEffectMaterial.releaseReceivers(owner, [object]);
    expect(mesh.material).toBe(source);
  });

  test('removes hex tiling and restores the original material when variation is turned off', () => {
    const source = new MeshBasicMaterial({ map: new Texture() });
    const mesh = upFacingPlane(source);
    const owner = {};
    const object = customObject(mesh);
    CustomObjectEffectMaterial.adoptReceivers(owner, [object], false, true);

    expect(mesh.material).toBeInstanceOf(CustomObjectEffectMaterial);

    CustomObjectEffectMaterial.adoptReceivers(owner, [object], false, false);

    expect(mesh.material).toBe(source);
  });

  test('repeats a tiled map and mirrors a stretched map', () => {
    const repeated = new Texture();
    repeated.repeat.set(4, 4);
    const repeatedMesh = upFacingPlane(new MeshBasicMaterial({ map: repeated }));
    CustomObjectEffectMaterial.adoptReceivers({}, [customObject(repeatedMesh)], true, true);

    expect(repeated.wrapS).toBe(RepeatWrapping);
    expect(repeated.wrapT).toBe(RepeatWrapping);

    const stretched = new Texture();
    stretched.repeat.set(1, 1);
    const stretchedMesh = upFacingPlane(new MeshBasicMaterial({ map: stretched }));
    CustomObjectEffectMaterial.adoptReceivers({}, [customObject(stretchedMesh)], true, true);

    expect(stretched.wrapS).toBe(MirroredRepeatWrapping);
    expect(stretched.wrapT).toBe(MirroredRepeatWrapping);
  });
});
