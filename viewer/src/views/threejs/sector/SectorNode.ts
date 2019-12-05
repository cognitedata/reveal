/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';

export class SectorNode extends THREE.Group {
  public needsRedraw: boolean = true;

  constructor() {
    super();
    this.name = 'Sector model';
  }
}
