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

import { Vector3 } from "./Vector3";
import { Random } from "../Core/Random";

export class Points
{
    //==================================================
    // FIELDS
    //==================================================

    public list: Array<Vector3> = new Array<Vector3>();

    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor()
    {
    }

    public copy(): Points
    {
        const result = new Points()
        result.list = [...this.list]; // This syntax sucks!
        return result;
    }

    //==================================================
    // INSTANCE METHODS: Operations
    //==================================================

    public add(point: Vector3): void
    {
        this.list.push(point);
    }

    //==================================================
    // STATIC METHODS: 
    //==================================================

    public static createByRandom(pointCount: number): Points
    {
        const result = new Points();
        for (let i = 0; i < pointCount; i++)
        {
            const x = Random.getFloat(0, 100);
            const y = Random.getFloat(0, 100);
            const z = Random.getFloat(0, 100);
            const point = new Vector3(x, y, z);
            result.add(point);
        }
        return result;
    }

}
