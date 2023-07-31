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

import { Util } from '../Primitives/Util';

export class TextItem {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  public key: string;

  public value: string | undefined;

  public dx = 0;

  public dy = 0;

  public isMultiLine = false;

  public isBold = false;

  public paddingTop = 0;

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get hasValue(): boolean {
    return Util.isEmpty(this.value);
  }

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  constructor(
    key: string,
    isBold: boolean,
    value?: string,
    paddingTop?: number
  ) {
    this.key = key;
    this.isBold = isBold;
    this.value = value;
    this.paddingTop = paddingTop || 0;
  }
}
