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

import { ITargetIdAccessor } from '../Interfaces/ITargetIdAccessor';
import { TargetId } from '../Primitives/TargetId';

import { BaseStyle } from './BaseStyle';

export abstract class BaseRenderStyle
  extends BaseStyle
  implements ITargetIdAccessor
{
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  protected static readonly fontSizeOptions: number[] = [
    6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 30, 36, 50,
  ];

  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private _targetId: TargetId;

  public isDefault = false;

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get targetId(): TargetId {
    return this._targetId;
  }

  public set targetId(value: TargetId) {
    this._targetId = value;
  }

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(targetId: TargetId) {
    super();
    this._targetId = targetId.clone();
  }
}
