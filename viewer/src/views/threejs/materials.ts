/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { sectorShaders, shaderDefines } from './cad/shaders';

export enum RenderType {
  Color = 1,
  Normal,
  TreeIndex,
  PackColorAndNormal
}
