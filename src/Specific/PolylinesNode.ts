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
import { PolylinesDrawStyle } from "./PolylinesDrawStyle";
import { BaseDrawStyle } from "../Styles/BaseDrawStyle";
import { TargetId } from "../Core/TargetId";
import { Polylines } from "../Geometry/Polylines";

export class PolylinesNode extends BaseNode
{
    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor()
    {
        super();
        this._data = null;
    }

    //==================================================
    // FIELDS
    //==================================================

    private _data: Polylines | null;

    //==================================================
    // PROPERTIES
    //==================================================

    public get data(): Polylines | null { return this._data; }

    //==================================================
    // OVERRIDES of Identifiable
    //==================================================

    public /*override*/ get className(): string { return PolylinesNode.name; }
    public /*override*/ isA(className: string): boolean { return className == PolylinesNode.name || super.isA(className); }

    //==================================================
    // OVERRIDES of BaseNode
    //==================================================

    public /*override*/ createDrawStyle(targetId: TargetId): BaseDrawStyle | null
    {
        return new PolylinesDrawStyle(targetId);
    }
}