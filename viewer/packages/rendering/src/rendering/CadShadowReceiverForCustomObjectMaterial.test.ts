/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import {
  DepthTexture,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  Texture
} from 'three';
import { Mock } from 'moq.ts';
import type { ICustomObject } from '@reveal/utilities';
import { CadShadowReceiverForCustomObjectMaterial } from './CadShadowReceiverForCustomObjectMaterial';
import type { CadShadowMap } from '../render-pipeline-providers/types';

describe(CadShadowReceiverForCustomObjectMaterial.name, () => {
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
    .setup(p => p.depthRange)
    .returns(10)
    .object();
  const camera = new PerspectiveCamera();
  const renderer = new Mock<WebGLRenderer>().object();

  function draw(material: CadShadowReceiverForCustomObjectMaterial): void {
    material.onBeforeRender(renderer, new Scene(), camera, undefined, undefined, undefined);
  }

  test('copies the frame shadow map when the material is drawn', () => {
    const receiver = new CadShadowReceiverForCustomObjectMaterial('#88aa44');
    CadShadowReceiverForCustomObjectMaterial.setFrameShadowMap(shadowMap);

    draw(receiver);

    expect(receiver.uniforms.cadShadowApply.value).toBe(1);
    expect(receiver.uniforms.tCadShadowMap.value).toBe(shadowMap.depthTexture);
    expect(receiver.uniforms.cadShadowMatrix.value.elements).toEqual(shadowMatrix.elements);
    expect(receiver.uniforms.cadCameraMatrixWorld.value.elements).toEqual(camera.matrixWorld.elements);
    CadShadowReceiverForCustomObjectMaterial.setFrameShadowMap(undefined);
  });

  test('drops the shadow when the frame has no shadow map', () => {
    const receiver = new CadShadowReceiverForCustomObjectMaterial();
    CadShadowReceiverForCustomObjectMaterial.setFrameShadowMap(shadowMap);
    draw(receiver);
    CadShadowReceiverForCustomObjectMaterial.setFrameShadowMap(undefined);

    draw(receiver);

    expect(receiver.uniforms.cadShadowApply.value).toBe(0);
    expect(receiver.uniforms.tCadShadowMap.value).toBeNull();
  });

  test('copies texture repeat from the receiver map', () => {
    const map = new Texture();
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(4, 2);
    map.offset.set(0.1, 0.25);
    const receiver = new CadShadowReceiverForCustomObjectMaterial('#ffffff', map);
    CadShadowReceiverForCustomObjectMaterial.setFrameShadowMap(shadowMap);

    draw(receiver);

    expect(receiver.uniforms.tReceiver.value).toBe(map);
    expect((receiver.uniforms.tReceiverTransform.value as Matrix3).elements).toEqual([...map.matrix.elements]);
    CadShadowReceiverForCustomObjectMaterial.setFrameShadowMap(undefined);
  });

  test('builds a receiver material for an up-facing plane and keeps its texture repeat', () => {
    const map = new Texture();
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(3, 5);
    const source = new MeshBasicMaterial({ color: '#446688', map });
    const mesh = new Mesh(new PlaneGeometry(12, 8), source);
    mesh.rotation.x = -Math.PI / 2;
    const customObject = new Mock<ICustomObject>()
      .setup(p => p.object)
      .returns(mesh)
      .setup(p => p.receiveShadow)
      .returns(true)
      .object();

    CadShadowReceiverForCustomObjectMaterial.adoptReceivers([customObject]);

    expect(mesh.material).toBeInstanceOf(CadShadowReceiverForCustomObjectMaterial);
    const receiver = mesh.material as unknown as CadShadowReceiverForCustomObjectMaterial;
    expect(receiver.uniforms.tReceiver.value).toBe(map);
    expect((receiver.uniforms.tReceiverTransform.value as Matrix3).elements).toEqual([...map.matrix.elements]);
    expect(receiver.uniforms.receiverColor.value).toEqual(source.color);
  });

  test('keeps the original material until shadows are shown, then restores it', () => {
    const source = new MeshBasicMaterial({ color: '#112233' });
    const mesh = new Mesh(new PlaneGeometry(6, 4), source);
    mesh.rotation.x = -Math.PI / 2;
    const customObject = new Mock<ICustomObject>()
      .setup(p => p.object)
      .returns(mesh)
      .setup(p => p.receiveShadow)
      .returns(true)
      .object();

    CadShadowReceiverForCustomObjectMaterial.adoptReceivers([customObject], false);

    expect(mesh.material).toBe(source);

    CadShadowReceiverForCustomObjectMaterial.setShadowMaterialsVisible(true);

    expect(mesh.material).toBeInstanceOf(CadShadowReceiverForCustomObjectMaterial);
    const receiver = mesh.material;

    CadShadowReceiverForCustomObjectMaterial.setShadowMaterialsVisible(false);

    expect(mesh.material).toBe(source);

    CadShadowReceiverForCustomObjectMaterial.setShadowMaterialsVisible(true);

    expect(mesh.material).toBe(receiver);
  });
});
