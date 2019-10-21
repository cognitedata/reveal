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

import { BaseView } from "../Views/BaseView";
import { BaseNode } from "../Nodes/BaseNode";
import { ITargetId } from "./ITargetId";

export class ViewList
{
    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor() { }

    //==================================================
    // FIELDS
    //==================================================

    public list: BaseView[] =  [];

    //==================================================
    // INSTANCE METHODS
    //==================================================

    public add(view: BaseView): void
    {
        this.list.push(view);
    }

    public remove(view: BaseView): boolean
    {
        const index = this.list.indexOf(view, 0);
        if (index < 0)
            return false;

        this.list.splice(index, 1);
        return true;
    }

    public clear(): void
    {
        this.list.splice(0, this.list.length);
    }

    public getViewByTarget(target: ITargetId): BaseView | null
    {
        const view = this.list.find((v: BaseView) => v.getTarget() === target);
        return view === undefined ? null : view;
    }
}
