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

import { BaseNode } from "../Nodes/BaseNode";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import { TargetId } from "../Core/TargetId";
import { Polylines } from "../Geometry/Polylines";
import { PolylinesRenderStyle } from "./PolylinesRenderStyle";

export class PolylinesNode extends BaseNode
{
    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor() { super(); }

    //==================================================
    // FIELDS
    //==================================================

    private _data: Polylines | null = null;

    //==================================================
    // PROPERTIES
    //==================================================

    public get data(): Polylines | null { return this._data; }
    public set data(value: Polylines | null) { this._data = value; }

    //==================================================
    // OVERRIDES of Identifiable
    //==================================================

    public /*override*/ get className(): string { return PolylinesNode.name; }
    public /*override*/ isA(className: string): boolean { return className == PolylinesNode.name || super.isA(className); }

    //==================================================
    // OVERRIDES of BaseNode
    //==================================================

    public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
    {
        return new PolylinesRenderStyle(targetId);
    }
}