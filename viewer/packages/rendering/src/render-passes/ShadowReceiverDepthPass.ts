/*!
 * Copyright 2026 Cognite AS
 */

import type { Camera, Object3D, Scene, WebGLRenderer } from 'three';
import { DoubleSide, MeshDepthMaterial } from 'three';
import type { ICustomObject } from '@reveal/utilities';
import type { RenderPass } from '../RenderPass';

/** Renders custom meshes marked with `receiveShadow` to a depth target. */
export class ShadowReceiverDepthPass implements RenderPass {
  // Ground planes are commonly double-sided. The override material does not
  // inherit the side setting from the receiver's own material.
  private readonly _material = new MeshDepthMaterial({ side: DoubleSide });

  constructor(
    private readonly _scene: Scene,
    private readonly _customObjects: ICustomObject[]
  ) {}

  public get hasReceivers(): boolean {
    return this._customObjects.some(({ object }) => containsReceiver(object));
  }

  public render(renderer: WebGLRenderer, camera: Camera): void {
    const visibility = new Map<Object3D, boolean>();
    const overrideMaterial = this._scene.overrideMaterial;

    for (const child of this._scene.children) {
      visibility.set(child, child.visible);
      child.visible = this._customObjects.some(({ object }) => object === child && containsReceiver(object));
    }

    // Keep only subtrees that contain opted-in receiver meshes.
    for (const { object } of this._customObjects) {
      object.traverse(node => {
        if (node === object) return;
        visibility.set(node, node.visible);
        if (!containsReceiver(node)) node.visible = false;
      });
    }

    try {
      this._scene.overrideMaterial = this._material;
      renderer.clear();
      renderer.render(this._scene, camera);
    } finally {
      this._scene.overrideMaterial = overrideMaterial;
      visibility.forEach((visible, object) => (object.visible = visible));
    }
  }

  public dispose(): void {
    this._material.dispose();
  }
}

function containsReceiver(object: Object3D): boolean {
  if ('isMesh' in object && object.isMesh === true && object.receiveShadow) return true;
  return object.children.some(containsReceiver);
}
