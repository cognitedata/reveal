//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import clone from 'lodash/clone';

import { BaseLogSample } from '../../../SubSurface/Wells/Samples/BaseLogSample';

export class CasingLogSample extends BaseLogSample {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  public baseMd: number;

  public radius: number;

  public name: string = '';

  public comments: string = '';

  public currentStatusComment: string = '';

  public outerDiameter?: string = '';

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(
    radius: number,
    topMd: number,
    baseMd: number,
    outerDiameter?: string
  ) {
    super(topMd);
    this.baseMd = baseMd;
    this.radius = radius;
    this.outerDiameter = outerDiameter;
  }

  //= =================================================
  // OVERRIDES of MdSample
  //= =================================================

  public /* override */ toString(): string {
    return `${super.toString()} Radius: ${this.radius}`;
  }

  public /* override */ getSampleText(): string {
    return Number.isNaN(this.radius)
      ? 'No casing'
      : `Radius = ${this.radius.toFixed(3)}`;
  }

  //= =================================================
  // OVERRIDES of BaseLogSample
  //= =================================================

  public get /* override */ isEmpty(): boolean {
    return Number.isNaN(this.radius);
  }

  public /* override */ clone(): BaseLogSample {
    return clone<CasingLogSample>(this);
  }
}
