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

import * as Color from "color"

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Colors } from "@/Core/Primitives/Colors";

import { MdSample } from "@/Nodes/Wells/Samples/MdSample";

export class RenderSample extends MdSample
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public point: Vector3;
  public radius: number;
  public color: Color;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get isEmpty(): boolean { return this.radius <= 0 || Number.isNaN(this.radius); }

  //==================================================
  // OVERRIDES of MdSample
  //==================================================

  public /*override*/ toString(): string { return `${super.toString()} Point: ${this.point} radius: ${this.radius}`; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  constructor(point: Vector3, md: number, radius = 0, color: Color = Colors.white)
  {
    super(md);
    this.point = point;
    this.radius = radius;
    this.color = color;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public isEqualColorAndRadius(other: RenderSample): boolean { return this.color === other.color && this.radius === other.radius; }
}