/*!
 * Copyright 2026 Cognite AS
 */

import { DoubleSide } from 'three';
import { NodeMaterial } from 'three/webgpu';

import type { CadSharedUniformNodes } from './CadSharedUniforms';

export abstract class CadNodeMaterial extends NodeMaterial {
  public readonly sharedUniforms: CadSharedUniformNodes;

  constructor(sharedUniforms: CadSharedUniformNodes, name: string) {
    super();
    this.name = name;
    this.sharedUniforms = sharedUniforms;
    this.side = DoubleSide;
    this.clipping = true;
    this.transparent = true;
    this.depthWrite = true;
    this.depthTest = true;
  }
}
