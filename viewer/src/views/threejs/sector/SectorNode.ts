/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { mat4 } from 'gl-matrix';
import { SectorModelTransformation } from '../../../models/sector/types';

export class SectorNode extends THREE.Group {
  public needsRedraw: boolean = true;
  public modelTransformation: SectorModelTransformation;

  constructor(options: { modelTransformation: SectorModelTransformation }) {
    super();
    this.name = 'Sector model';
    this.modelTransformation = options.modelTransformation;
  }
}
