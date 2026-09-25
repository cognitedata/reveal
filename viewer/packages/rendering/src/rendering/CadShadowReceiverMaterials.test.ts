/*!
 * Copyright 2026 Cognite AS
 */

import type { Material } from 'three';
import { BackSide, LineBasicMaterial, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera } from 'three';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';
import type { ICustomObject } from '@reveal/utilities';
import { CadShadowReceiverMaterials } from './CadShadowReceiverMaterials';
import type { CadShadowMap } from '../render-pipeline-providers/types';

describe(CadShadowReceiverMaterials.name, () => {
  const shadowMap = new Mock<CadShadowMap>()
    .setup(p => p.matrix)
    .returns(new Matrix4())
    .object();
  const camera = new PerspectiveCamera();

  function createReceiver(material: Material) {
    const mesh = new Mesh(undefined, material);
    const customObject = new Mock<ICustomObject>()
      .setup(p => p.object)
      .returns(mesh)
      .setup(p => p.receiveShadow)
      .returns(true)
      .object();
    return { mesh, customObject, receivers: new CadShadowReceiverMaterials(shadowMap) };
  }

  test.each([
    ['disabled', (receivers: CadShadowReceiverMaterials) => receivers.disable()],
    ['removed from the scene', (receivers: CadShadowReceiverMaterials) => receivers.update([], camera)]
  ])('restores receivers when %s', (_, restore) => {
    const { mesh, customObject, receivers } = createReceiver(new MeshBasicMaterial());
    const originalHook = mesh.material.onBeforeCompile;

    receivers.update([customObject], camera);
    expect(mesh.receiveShadow).toBe(true);
    expect(mesh.material.onBeforeCompile).not.toBe(originalHook);

    restore(receivers);
    expect(mesh.receiveShadow).toBe(false);
    expect(mesh.material.onBeforeCompile).toBe(originalHook);
  });

  test('does not install receivers on a skybox or when receiveShadow is off', () => {
    const sky = createReceiver(new MeshBasicMaterial({ side: BackSide }));
    const skyHook = sky.mesh.material.onBeforeCompile;
    sky.receivers.update([sky.customObject], camera);
    expect(sky.mesh.receiveShadow).toBe(false);
    expect(sky.mesh.material.onBeforeCompile).toBe(skyHook);

    const mesh = new Mesh(undefined, new MeshBasicMaterial());
    const customObject = new Mock<ICustomObject>()
      .setup(p => p.object)
      .returns(mesh)
      .setup(p => p.receiveShadow)
      .returns(false)
      .object();
    new CadShadowReceiverMaterials(shadowMap).update([customObject], camera);
    expect(mesh.receiveShadow).toBe(false);
  });

  test('leaves unsupported materials untouched', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { mesh, customObject, receivers } = createReceiver(new LineBasicMaterial());
    const originalHook = mesh.material.onBeforeCompile;

    receivers.update([customObject], camera);

    expect(mesh.material.onBeforeCompile).toBe(originalHook);
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });
});
