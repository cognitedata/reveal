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

import * as THREE from 'three';
import { Base3DView } from "../Core/Views/Base3DView";
import { ThreeTargetNode } from "./ThreeTargetNode";

export abstract class BaseThreeView extends Base3DView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get scene(): THREE.Scene { return this.target.scene; }
  protected get camera(): THREE.Camera { return this.target.activeCamera; }
  protected get target(): ThreeTargetNode { return super.getTarget() as ThreeTargetNode; }
}
