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

import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { ITargetIdAccessor } from "@/Core/Interfaces/ITargetIdAccessor";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { BaseTargetNode } from "@/Core/Nodes/BaseTargetNode";

export abstract class BaseView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _node: BaseNode | null = null;
  private _target: ITargetIdAccessor | null = null;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get targetId(): TargetId { return this.getTarget().targetId; }
  protected get renderTarget(): BaseTargetNode { return this.getTarget() as BaseTargetNode; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { }

  //==================================================
  // VIRTUAL METHODS: 
  //==================================================

  public get /*virtual*/ isVisible(): boolean { return true; }

  protected /*virtual*/ initializeCore(): void
  {
    // Override this function to initialize your view
    // NOTE: Always call super.initializeCore() in the overrides
  }

  protected /*virtual*/ updateCore(args: NodeEventArgs): void
  {
    // Override this function to update your view
    // NOTE: Always call super.updateCore(args) in the overrides
  }

  protected /*virtual*/ clearMemoryCore(): void
  {
    // Override this function to remove redundant data
    // NOTE: Always call super.clearMemoryCore() in the overrides
  }

  protected /*virtual*/ onShowCore(): void
  {
    // Override this function to when your view
    // need to do something when it is set visible
    // NOTE: Always call super.onShowCore() in the overrides
  }

  protected /*virtual*/ onHideCore(): void
  {
    // Override this function to when your view
    // need to do something when it is set NOT visible
    // NOTE: Always call super.onHideCore() in the overrides
  }

  public /*virtual*/ beforeRender(): void 
  {
    // Override this function to when your view
    // need to do just before rendering
    // NOTE: Always call super.beforeRender() in the overrides
  }

  protected /*virtual*/ disposeCore(): void
  {
    // Override this function to when your view
    // need to do something when it is set NOT visible
    // Called just before removal from view list and detach
    // NOTE: Always call super.disposeCore() in the overrides
  }

  public /*virtual*/ shouldPick(): boolean { return true; }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getNode(): BaseNode
  {
    if (!this._node)
      throw Error("The node is missing in the view");
    return this._node;
  }

  public getTarget(): ITargetIdAccessor 
  {
    if (!this._target)
      throw Error("The target is missing in the view");
    return this._target;
  }

  protected getStyle(): BaseRenderStyle
  {
    let style: BaseRenderStyle | null;
    if (!this._target)
      style = this.getNode().getRenderStyle(TargetId.empty);
    else
      style = this.getNode().getRenderStyle(this.targetId);
    if (!style)
      throw Error("The style is missing in the view");
    return style;
  }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public initialize(): void
  {
    this.initializeCore();
    this.verify(); // Just checking that everything is set up properly
  }

  public update(args: NodeEventArgs): void
  {
    this.updateCore(args);
  }

  public clearMemory(): void
  {
    this.clearMemoryCore();
  }

  public onShow(): void 
  {
    this.onShowCore();
  }

  public onHide(): void 
  {
    this.onHideCore();
  }

  public dispose(): void
  {
    this.disposeCore();
  }

  public isOwner(node: BaseNode): boolean
  {
    return this._node !== null && this._node === node;
  }

  public detach(): void
  {
    this._node = null;
    this._target = null;
  }

  public attach(node: BaseNode, target: ITargetIdAccessor): void
  {
    // This is called after dispose
    this._node = node;
    this._target = target;
  }

  public verify(): boolean
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