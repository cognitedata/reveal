//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import Icon from 'images/Nodes/SeismicCubeNode.png';
import { BaseTreeNode } from 'Core/Nodes/BaseTreeNode';

export class SeismicTreeNode extends BaseTreeNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'SeismicTreeNode';

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() {
    super();
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public get /* override */ className(): string {
    return SeismicTreeNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === SeismicTreeNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public get /* override */ typeName(): string {
    return 'Seismic Tree';
  }

  public /* override */ getIcon(): string {
    return Icon;
  }

  public /* override */ getName(): string {
    return 'Seismic';
  }

  public get /* override */ isTab(): boolean {
    return true;
  }
}
