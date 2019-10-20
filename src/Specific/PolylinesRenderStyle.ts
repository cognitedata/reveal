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

import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import { TargetId } from "../Core/TargetId";

export class PolylinesRenderStyle extends BaseRenderStyle
{
    //==================================================
    // FIELDS
    //==================================================

    lineWidth: number = 1;

    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor(targetId: TargetId) { super(targetId); }
    copy(): BaseRenderStyle
    {
        const style = new PolylinesRenderStyle(this.targetId);
        style.lineWidth = this.lineWidth;
        return style;
    }

}



