/*!
 * Copyright 2026 Cognite AS
 */

import { NodeMaterial } from 'three/webgpu';
import { Fn, texture, uniform, uv, vec4 } from 'three/tsl';
import type { Texture } from 'three';

export class BlitNodeMaterial extends NodeMaterial {
  constructor(name: string) {
    super();
    this.name = name;
  }

  setDiffuseTexture(diffuseTexture: Texture): void {
    const tDiffuse = uniform(diffuseTexture);
    this.fragmentNode = Fn(() => vec4(texture(tDiffuse, uv()).rgb, 1.0))();
    this.needsUpdate = true;
  }
}

export function createBlitNodeMaterial(diffuseTexture: Texture, name = 'Blit (WebGPU)'): BlitNodeMaterial {
  const material = new BlitNodeMaterial(name);
  material.setDiffuseTexture(diffuseTexture);
  return material;
}
