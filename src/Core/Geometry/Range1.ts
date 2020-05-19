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

import { Ma } from "@/Core/Primitives/Ma";

export class Range1
{
  //==================================================
  // STATIC PROPERTIES
  //==================================================

  public static get newUnit(): Range1 { return new Range1(0, 1); }
  public static get newTest(): Range1 { return new Range1(-1000, 1000); }
  public static get newZTest(): Range1 { return new Range1(-100, 100); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _min: number = 0;
  private _max: number = 0;
  private _isEmpty: boolean = true;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get isEmpty(): boolean { return this._isEmpty; }
  public get isSingular(): boolean { return this.min === this.max; }
  public get hasSpan(): boolean { return !this.isEmpty && !this.isSingular; }
  public get min(): number { return this._min; }
  public set min(value: number) { this._min = value; }
  public get max(): number { return this._max; }
  public set max(value: number) { this._max = value; }
  public get delta(): number { return this._max - this._min; }
  public get center(): number { return (this._min + this._max) / 2; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(min?: number, max?: number)
  {
    if (min === undefined && max !== undefined)
      this.set(max, max);
    else if (min !== undefined && max === undefined)
      this.set(min, min);
    else if (min !== undefined && max !== undefined)
      this.set(min, max);
  }

  public /*copy constructor*/ copy(): Range1
  {
    const range = new Range1();
    range._min = this._min;
    range._max = this._max;
    range._isEmpty = this._isEmpty;
    return range;
  }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  isEqual(other: Range1): boolean
  {
    if (this._isEmpty && other._isEmpty)
      return true;
    if (this._isEmpty !== other._isEmpty)
      return false;
    return this.min === other.min && this.max === other.max;
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public toString(): string { return `(${this._min}, ${this._max})`; }

  public getFraction(value: number): number
  {
    // Opposite of getValue
    return (value - this.min) / this.delta;
  }

  public getValue(fraction: number): number
  {
    // Opposite of getFraction
    return fraction * this.delta + this.min;
  }

  public getBestInc(numTicks = 50): number
  {
    const inc = this.delta / numTicks;
    return Ma.roundInc(inc);
  }

  public getNumTicks(inc: number): number { return Math.round(this.delta / inc); }

  public * getTicks(inc: number): Iterable<number>
  {
    if (this.getNumTicks(inc) > 1000) // This is a safety valve to prevent it going infinity loops
      return;

    const tolerance = inc / 10000;
    const max = this.max + tolerance;
    for (let tick = this.min; tick <= max; tick += inc)
    {
      if (Math.abs(tick) < tolerance)
        yield 0;
      else
        yield tick;
    }
  }

  public getBoldInc(inc: number, every = 2): number
  {
    let numTicks = 0;
    const boldInc = inc * every;
    for (const anyTick of this.getTicks(inc))
    {
      const tick = Number(anyTick);
      if (!Ma.isInc(tick, boldInc))
        continue;

      numTicks++;
      if (numTicks > 2)
        return boldInc;
    }
    return inc;
  }


  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public set(min: number, max: number): void
  {
    this._min = Math.min(min, max);
    this._max = Math.max(min, max);
    this._isEmpty = false;
  }

  public translate(value: number): void
  {
    if (this._isEmpty)
      return;

    this._min += value;
    this._max += value;
  }

  public scale(value: number): void
  {
    if (this._isEmpty)
      return;

    this._min *= value;
    this._max *= value;
  }

  public scaleDelta(scale: number): void
  {
    if (this._isEmpty)
      return;

    const center = this.center;
    this._min = (this._min - center) * scale + center;
    this._max = (this._max - center) * scale + center;
  }

  public add(value: number): void
  {
    if (this._isEmpty)
    {
      this._isEmpty = false;
      this._min = value;
      this._max = value;
    }
    else if (value < this._min)
      this._min = value;
    else if (value > this._max)
      this._max = value;
  }

  public addRange(value: Range1): void
  {
    if (value.isEmpty)
      return;

    this.add(value.min);
    this.add(value.max);
  }

  public expandByMargin(margin: number): void
  {
    if (this.isEmpty)
      return;
    this._min -= margin;
    this._max += margin;
    if (this._min > this._max)
      [this._max, this._min] = [this._min, this._max]; //Swap
  }

  public expandByFraction(fraction: number): void
  {
    if (!this.isEmpty)
      this.expandByMargin(this.delta * fraction);
  }

  public roundByInc(inc: number): boolean
  {
    if (this.isEmpty)
      return false;

    if (inc < 0)
    {
      this._min = Ma.ceil(this._min, -inc);
      this._max = Ma.floor(this._max, -inc);
      if (this._min > this._max)
        return false;
    }
    else if (inc > 0)
    {
      this._min = Ma.floor(this._min, inc);
      this._max = Ma.ceil(this._max, inc);
    }
    return true;
  }
}
