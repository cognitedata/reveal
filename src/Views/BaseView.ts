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

import { TargetNode } from "../Nodes/TargetNode";
import { NodeEventArgs } from "../Architecture/NodeEventArgs";
import { BaseNode } from "../Nodes/BaseNode";
import { BaseDrawStyle } from "../Styles/BaseDrawStyle";
import { TargetId } from "../Core/TargetId";

export abstract class BaseView
{
    //==================================================
    // FIELDS
    //==================================================

    private _node: BaseNode | null = null;
    private _target: TargetNode | null = null;
    private _isVisible: boolean = false;

    //==================================================
    // PROPERTIES
    //==================================================

    public get node(): BaseNode | null { return this._node; }
    public get target(): TargetNode | null { return this._target; }

    public get isVisible(): boolean { return this._isVisible; }
    public set isVisible(value: boolean) { this._isVisible = value; }
    public get stayAliveIfInvisible(): boolean { return false; }

    protected getStyle(): BaseDrawStyle | null 
    {
        if (!this.node)
          return null;
        if (!this.target)
          return this.node.getDrawStyle(TargetId.empty); 
        return this.node.getDrawStyle(this.target.targetId); 
     }

    //==================================================
    // CONSTRUCTORS
    //==================================================

    protected constructor() { }

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
        return this.node != null && this.node == node;
    }

    public detach(): void
    {
        this._node = null;
        this._target = null;
        // Override this function to when your view
        // need to do something when it is set NOT visible
    }

    public attach(node: BaseNode, target: TargetNode): void
    {
        // This is called after dispose
        this._node = node;
        this._target = target;
    }
}