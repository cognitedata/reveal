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

import Range1 from "@/Core/Geometry/Range1";

export class Statistics
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _sumSquared: number = 0;
  private _sum: number = 0;
  private _n: number = 0;
  private _range: Range1 = new Range1();;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get isEmpty(): boolean { return this._n === 0; }
  public get n(): number { return this._n; }
  public get mean(): number { return this.isEmpty ? Number.NaN : this._sum / this._n; }
  public get variance(): number { return this.isEmpty ? Number.NaN : (this._sumSquared - this._sum * this._sum / this._n) / this._n; }
  public get stdDev(): number { return this.isEmpty ? Number.NaN : Math.sqrt(this.variance); }
  public get range(): Range1 { return this._range; }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getStdDev(mean: number): number
  {
    if (this.isEmpty)
      return Number.NaN;

    const variance = this._sumSquared / this._n - mean * mean;
    return variance <= 0 ? 0 : Math.sqrt(variance);
  }

  public getMostOfRange(sigma: number, mean?: number): Range1 | undefined
  {
    if (this.n <= 2)
      return undefined;

    const range = new Range1(mean === undefined ? this.mean : mean);
    const margin = sigma * (mean === undefined ? this.stdDev : this.getStdDev(mean));
    range.expandByMargin(margin);
    return range;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public add(value: number): void
  {
    this._n++;
    this._sum += value;
    this._sumSquared += value * value;
    this.range.add(value);
  }

  public addWithNaN(value: number): void
  {
    if (!Number.isNaN(value))
      this.add(value);
  }

  public clear(): void
  {
    this._n = 0;
    this._sum = 0;
    this._sumSquared = 0;
    this.range.clear();
  }
}
