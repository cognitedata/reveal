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

import { BaseNode } from "@/Core/Nodes/BaseNode";

//==================================================
// LOCAL HELPER CLASS
//==================================================

class ChangedDecription
{
  public changed: symbol;
  public fieldName: string | undefined;
  public origin: BaseNode | null;

  public constructor(changed: symbol, fieldName?: string, origin: BaseNode | null = null)
  {
    this.changed = changed;
    this.fieldName = fieldName;
    this.origin = origin;
  }
}

export class NodeEventArgs
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private changes: ChangedDecription[] | null = null;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(changed: symbol, fieldName?: string)
  {
    this.add(changed, fieldName);
  }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  public get isEmpty(): boolean { return this.changes === null || this.changes.length === 0; }

  public isChanged(changed: symbol): boolean
  {
    if (!this.changes)
      return false;
    return this.changes.some((desc: ChangedDecription) => desc.changed === changed);
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  private getChangedDecription(changed: symbol): ChangedDecription | undefined
  {
    if (!this.changes)
      return undefined;
    return this.changes.find((desc: ChangedDecription) => desc.changed === changed);
  }

  public getFieldName(changed: symbol): string | undefined
  {
    const changedDecription = this.getChangedDecription(changed);
    return changedDecription ? changedDecription.fieldName : undefined;
  }

  public getOrigin(changed: symbol): BaseNode | null
  {
    const changedDecription = this.getChangedDecription(changed);
    return changedDecription ? changedDecription.origin : null;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public add(changed: symbol, fieldName?: string)
  {
    if (changed === undefined)
      return;
    if (!this.changes)
      this.changes = [];

    this.changes.push(new ChangedDecription(changed, fieldName));
  }
}
