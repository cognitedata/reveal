//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { BaseView } from "../Architecture/BaseView";
import { ThreeTargetNode } from "./ThreeTargetNode";
import * as THREE from 'three';

export class ThreeView extends BaseView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get target(): ThreeTargetNode {
    if (!super.getTarget()) {
      throw "ERROR: Could not get target.";
    }
    return super.getTarget()! as ThreeTargetNode;
  }
  protected get scene(): THREE.Scene { return this.target.scene; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================
}
