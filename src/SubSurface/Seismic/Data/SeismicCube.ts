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

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Index3 } from "@/Core/Geometry/Index3";
import { RegularGrid3 } from "@/Core/Geometry/RegularGrid3";
import { Trace } from '@/SubSurface/Seismic/Data/Trace';
import { Index2 } from '@/Core/Geometry/Index2';

export class SeismicCube extends RegularGrid3
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private readonly _traces: (Trace | null)[];

  private readonly _usedTraces: Index2[] = [];

  private _maxTracesInMemory: number = 1000;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get numberOfTraces(): number { return (this.nodeSize.i - 1) * (this.nodeSize.j - 1); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(nodeSize: Index3, origin: Vector3, inc: Vector3, rotationAngle: number | undefined = undefined)
  {
    super(nodeSize, origin, inc, rotationAngle);
    this._traces = new Array<Trace | null>(this.numberOfTraces);
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getTrace(i: number, j: number): Trace | null 
  {
    const index = this.getCellIndex2(i, j);
    let trace = this._traces[index];
    if (trace)
      return trace;

    trace = this.readTrace(i, j);
    if (!trace)
      return null;

    this.garbageCollectAt(i, j);
    this._traces[index] = trace;
    return trace;
  }

  public getRegularGrid(): RegularGrid3
  {
    return new RegularGrid3(this.nodeSize, this.origin, this.inc, this.rotationAngle);
  }

  //==================================================
  // INSTANCE METHODS: Read trace
  //==================================================

  private readTrace(i: number, j: number): Trace | null 
  {
    const trace = new Trace(this.cellSize.k);
    trace.generateSynthetic(i / (this.cellSize.i - 1), j / (this.cellSize.j - 1));
    return trace;
  }

  //==================================================
  // INSTANCE METHODS: Garbage Collection
  //==================================================

  private garbageCollectAt(i: number, j: number): void
  {
    this._usedTraces.push(new Index2(i, j));
    this.garbageCollect();
  }

  private garbageCollect(): void
  {
    if (this._usedTraces.length > this._maxTracesInMemory)
    {
      const lowerLimit = this._maxTracesInMemory / 2;
      const deleteCount = this._usedTraces.length - lowerLimit;
      const startIndex = 0;
      for (let i = startIndex; i < deleteCount; i++)
      {
        const cell = this._usedTraces[i];
        const index = this.getCellIndex2(cell.i, cell.j);
        this._traces[index] = null;
      }
      this._traces.splice(startIndex, deleteCount);
    }
  }
}
