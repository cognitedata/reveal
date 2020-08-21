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
import Index3 from "@/Core/Geometry/Index3";
import { RegularGrid3 } from "@/Core/Geometry/RegularGrid3";
import { Trace } from "@/SubSurface/Seismic/Data/Trace";
import Index2 from "@/Core/Geometry/Index2";
import SeismicStk from "@cognite/seismic-sdk-js";
import Range1 from "@/Core/Geometry/Range1";
import { Statistics } from "@/Core/Geometry/Statistics";
import { Ma } from "@/Core/Primitives/Ma";
import Range3 from "@/Core/Geometry/Range3";

export class SeismicCube extends RegularGrid3
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private readonly _traces: (Trace | null)[];
  private readonly _usedTraces: Index2[] = [];
  private _maxTracesInMemory: number = 1000;
  public client: SeismicStk.CogniteSeismicClient | null = null;
  public fileId = "";
  private _valueRange?: Range1;
  private _statistics?: Statistics;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get numberOfTraces(): number { return (this.nodeSize.i - 1) * (this.nodeSize.j - 1); }
  public get valueRange(): Range1 | undefined { return this._valueRange; }
  public set valueRange(range: Range1 | undefined) { this._valueRange = range; }
  public get statistics(): Statistics | undefined { return this._statistics; }

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
    const result = new RegularGrid3(this.nodeSize, this.origin, this.inc, this.rotationAngle);
    result.startCell.copy(this.startCell);
    return result;
  }

  public getRealValue(value: number)
  {
    return value;
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
  // INSTANCE METHODS: Garbage collection
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

  //==================================================
  // INSTANCE METHODS: Load
  //==================================================

  public loadTraces(minCell: Index2, maxCell: Index2, include_trace_header?: boolean): Promise<SeismicStk.Trace[]> | null
  {
    if (!this.client || !this.fileId)
      return null;

    const iline = { min: minCell.i, max: maxCell.i };
    const xline = { min: minCell.j, max: maxCell.j };

    iline.min += this.startCell.i;
    iline.max += this.startCell.i;
    xline.min += this.startCell.j;
    xline.max += this.startCell.j;

    // console.log(`volume.get() inline: ${iline.min} / ${iline.max} xline: ${xline.min} / ${xline.max}`);
    return this.client.volume.get(this, { iline, xline }, include_trace_header);
  }

  public loadTrace(cell: Index2): Promise<SeismicStk.Trace> | null
  {
    if (!this.client || !this.fileId)
      return null;

    const inline = cell.i + this.startCell.i;
    const xline = cell.j + this.startCell.j;
    return this.client.volume.getTrace(this, inline, xline);
  }

  public calculateStatistics(): void
  {
    const iHalf = Math.round(this.cellSize.i / 2);
    const jHalf = Math.round(this.cellSize.j / 2);
    const iMax = this.cellSize.i - 1;
    const jMax = this.cellSize.j - 1;

    let minCell = new Index2(iHalf, 0);
    let maxCell = new Index2(iHalf, jMax);
    const promise1 = this.loadTraces(minCell, maxCell);

    minCell = new Index2(0, jHalf);
    maxCell = new Index2(iMax, jHalf);
    const promise2 = this.loadTraces(minCell, maxCell);

    Promise.all([promise1, promise2]).then(multiTraces =>
    {
      const statistics = new Statistics();
      for (const traces of multiTraces)
      {
        if (!traces)
          continue;

        for (const trace of traces)
        {
          for (let value of trace.traceList)
          {
            if (value === 0)
              continue;

            value = this.getRealValue(value);
            statistics.add(value);
          }
        }
      }
      this._statistics = statistics;
      this.valueRange = statistics.getMostOfRange(4);
    });
  }

  //==================================================
  // STATIC METHODS: Load
  //==================================================

  public static async loadCube(client: SeismicStk.CogniteSeismicClient, fileId: string): Promise<SeismicCube | null>
  {
    const lineRange = await client.file.getLineRange({ fileId });
    if (!lineRange)
      throw Error("lineRange in undefined");
    if (!lineRange.inline)
      throw Error("lineRange.inline in undefined");
    if (!lineRange.xline)
      throw Error("lineRange.inline in undefined");

    const minCell = Index2.newZero;
    const maxCell = Index2.newZero;
    {
      const { min, max } = lineRange.inline;
      if (min === undefined || max === undefined)
        throw Error("lineRange.inline.max/max is undefined");

      minCell.i = min.value;
      maxCell.i = max.value;
    }
    {
      const { min, max } = lineRange.xline;
      if (min === undefined || max === undefined)
        throw Error("lineRange.xline.max/max is undefined");

      minCell.j = min.value;
      maxCell.j = max.value;
    }
    // console.log(`Min and max index: ${minIndex.toString()} ${maxIndex.toString()}`);
    const promises = [
      client.volume.getTrace({ fileId }, minCell.i, minCell.j),
      client.volume.getTrace({ fileId }, maxCell.i, minCell.j),
      client.volume.getTrace({ fileId }, maxCell.i, maxCell.j),
      client.volume.getTrace({ fileId }, minCell.i, maxCell.j)
    ];
    const numCellsI = maxCell.i - minCell.i + 1;
    const numCellsJ = maxCell.j - minCell.j + 1;

    if (numCellsI <= 0)
      throw Error("numCellsI is 0");
    if (numCellsJ <= 0)
      throw Error("numCellsJ is 0");

    const cornerPoints: Vector3[] = [];
    const cornerCells: Index2[] = [];

    const traces = await Promise.all(promises);
    let numCellsK = 0;
    for (const trace of traces)
    {
      numCellsK = Math.max(trace.traceList.length, numCellsK);

      if (!trace.coordinate)
        throw Error("trace.coordinate is undefined");
      if (!trace.iline)
        throw Error("trace.iline is undefined");
      if (!trace.xline)
        throw Error("trace.xline is undefined");

      const { x, y } = trace.coordinate;
      const corner = new Vector3(x, y);
      cornerPoints.push(corner);

      const cell = new Index2(trace.iline.value, trace.xline.value);
      cell.substract(minCell);
      cornerCells.push(cell);
    }
    if (numCellsK <= 0)
      throw Error("numCellsK is 0");

    if (cornerPoints.length !== 4 || cornerCells.length !== 4)
      throw Error("Not 3 corners");

    // Get the corners
    let corner00: Vector3 | null = null;
    let cornerN0: Vector3 | null = null;
    let corner0N: Vector3 | null = null;
    for (let i = 0; i < cornerCells.length; i++)
    {
      const cell = cornerCells[i];
      const corner = cornerPoints[i];
      if (cell.isZero)
        corner00 = corner;
      else if (cell.i > 0 && cell.j === 0)
        cornerN0 = corner;
      else if (cell.i === 0 && cell.j > 0)
        corner0N = corner;
    }
    if (!corner00)
      throw Error("Miss corner00");
    if (!cornerN0)
      throw Error("Miss cornerN0");
    if (!corner0N)
      throw Error("Miss corner0N");

    let cube: SeismicCube;
    const nodeSize = new Index3(numCellsI + 1, numCellsJ + 1, numCellsK + 1);

    // eslint-disable-next-line no-constant-condition
    // if (false)
    // {
    //   const iAxis = Vector3.substract(cornerN0, corner00);
    //   const jAxis = Vector3.substract(corner0N, corner00);

    //   const iInc = iAxis.length / numCellsI;
    //   const jInc = jAxis.length / numCellsJ;

    //   const a = iAxis.clone();
    //   a.divideScalar(numCellsI);
    //   const b = jAxis.clone();
    //   b.divideScalar(numCellsJ);      

    //   const cellToNodeVector = a;
    //   cellToNodeVector.add(b);
    //   cellToNodeVector.multiplyScalar(-0.5);

    //   const origin = corner00;
    //   origin.add(cellToNodeVector);
    //   const inc = new Vector3(iInc, jInc, 4);
    //   const rotationAngle = iAxis.angle;
    //   cube = new SeismicCube(nodeSize, origin, inc, rotationAngle);
    // }
    //else
    {
      const range = Range3.newTest;
      range.expandByFraction(0.3);
      const origin = range.min;
      const inc = new Vector3(5, 5, 4);
      const rotationAngle = Ma.toRad(5);
      cube = new SeismicCube(nodeSize, origin, inc, rotationAngle);
    }
    cube.startCell = minCell;
    cube.client = client;
    cube.fileId = fileId;
    cube.calculateStatistics();
    return cube;
  }
}
