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

import { NodeEventArgs } from "./NodeEventArgs";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import { TargetId } from "../PrimitivClasses/TargetId";
import { TargetIdAccessor } from "../Interfaces/TargetIdAccessor";
import { BaseNode } from "../Nodes/BaseNode";

export abstract class BaseView
{
  //==================================================
  // FIELDS
  //==================================================

  private _node: BaseNode | null = null;
  private _target: TargetIdAccessor | null = null;
  private _isVisible: boolean = false;

  //==================================================
  // PROPERTIES
  //==================================================

  public get isVisible(): boolean { return this._isVisible; }
  public set isVisible(value: boolean) { this._isVisible = value; }
  public get stayAliveIfInvisible(): boolean { return false; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getNode(): BaseNode
  {
    if (!this._node)
      throw Error("The node is missing in the view");
    return this._node;
  }

  public getTarget(): TargetIdAccessor 
  {
    if (!this._target)
      throw Error("The target is missing in the view");
    return this._target;
  }

  protected getStyle(): BaseRenderStyle
  {
    let style: BaseRenderStyle | null = null;
    if (!this._target)
      style = this.getNode().getRenderStyle(TargetId.empty);
    else
      style = this.getNode().getRenderStyle(this._target.targetId);
    if (!style)
      throw Error("The style is missing in the view");
    return style;
  }

  //==================================================
  // VIRTUAL METHODS: 
  //==================================================

  public /*virtual*/ initialize(): void
  {
    // Override this function to initialize your view
  }

  public /*virtual*/ update(args: NodeEventArgs): void
  {
    // Override this function to update your view
  }

  public /*virtual*/ clearMemory(args: NodeEventArgs): void
  {
    // Override this function to remove redundant data
  }

  public /*virtual*/ onShow(): void
  {
    // Override this function to when your view
    // need to do something when it is set visible
  }

  public /*virtual*/ onHide(): void
  {
    // Override this function to when your view
    // need to do something when it is set NOT visible
  }

  public /*virtual*/ dispose(): void
  {
    // Override this function to when your view
    // need to do something when it is set NOT visible
    // Called just before removal from view list and detach
  }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public isOwner(node: BaseNode): boolean
  {
    return this._node != null && this._node === node;
  }

  public detach(): void
  {
    this._node = null;
    this._target = null;
    // Override this function to when your view
    // need to do something when it is set NOT visible
  }

  public attach(node: BaseNode, target: TargetIdAccessor): void
  {
    // This is called after dispose
    this._node = node;
    this._target = target;
  }

  public isOk(): boolean
  {
    // Used in unit testing
    if (!this.getNode())
      return false;
    if (!this.getTarget())
      return false;
    if (!this.getStyle())
      return false;
    if (!this.getNode().isInitialized)
      return false;
    return true;
  }
}