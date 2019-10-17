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

export class RevealTargetNode extends TargetNode
{
    //==================================================
    // FIELDS
    //==================================================

    public static readonly staticClassName: string = "RevealTargetNode";

    //==================================================
    // PROPERTIES
    //==================================================

    public get className(): string { return RevealTargetNode.staticClassName; }

    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor()
    {
        super();
    }
}