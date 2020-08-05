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

import { TargetTreeNode } from "@/Core/Nodes/Trees/TargetTreeNode";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { BaseTargetNode } from "@/Core/Nodes/BaseTargetNode";
import { ITargetIdAccessor } from "@/Core/Interfaces/ITargetIdAccessor";

export class BaseRootNode extends BaseNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "BaseRootNode";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor()
  {
    super();
    this.name = "Root";
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get targets(): TargetTreeNode
  {
    const child = this.getChildByType(TargetTreeNode);
    if (!child)
      throw new Error(`Cannot find the ${TargetTreeNode.className}`);
    return child;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseRootNode.className; }
  public /*override*/ isA(className: string): boolean { return className === BaseRootNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ canChangeColor(): boolean { return false; }
  public /*override*/ get typeName(): string { return "Root"; }

  protected /*override*/ get activeTargetIdAccessor(): ITargetIdAccessor | null
  {
    const targetNode = this.activeTarget;
    return targetNode as ITargetIdAccessor;
  }

  protected /*override*/ initializeCore(): void
  {
    super.initializeCore();
    if (!this.hasChildByType(TargetTreeNode))
      this.addChild(new TargetTreeNode());
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public get activeTarget(): BaseTargetNode | null
  {
    return this.targets.getActiveDescendantByType(BaseTargetNode);
  }

  //==================================================
  // STATICS FIELDS AND PROPERTIES
  //==================================================

  private static _active: BaseNode | null;
  public static get active(): BaseNode | null { return BaseRootNode._active; }
  public static set active(value: BaseNode | null) { BaseRootNode._active = value; }
}