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

export class NodeEventArgs
{
  //==================================================
  // STATIC FIELDS; More will come here
  //==================================================

  public static readonly nodeName: symbol = Symbol("nodeName");
  public static readonly nodeVisible: symbol = Symbol("nodeVisible");
  public static readonly nodeColor: symbol = Symbol("nodeColor");
  public static readonly childDeleted: symbol = Symbol("childDeleted");
  public static readonly drawStyle: symbol = Symbol("drawStyle");

  //==================================================
  // FIELDS
  //==================================================

  private _changes: ChangedDecription[] | null = null;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(changed: symbol, fieldName?: string)
  {
    if (changed === undefined)
      return;
    if (!this._changes)
      this._changes = [];
    this._changes.push(new ChangedDecription(changed, fieldName))
  }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  public get isEmpty(): boolean { return this._changes == null || this._changes.length === 0; }

  public isChanged(changed: symbol): boolean
  {
    const changedDecription = this.getChangedDecription(changed);
    return changedDecription !== undefined;
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getChangedDecription(changed: symbol): ChangedDecription | undefined
  {
    if (!this._changes)
      return undefined;
    return this._changes.find((desc: ChangedDecription) => desc.changed === changed);
  }

  public getFieldName(changed: symbol): string | undefined
  {
    const changedDecription = this.getChangedDecription(changed);
    return (changedDecription === undefined) ? undefined : changedDecription.fieldName;
  }
}

//==================================================
// LOCAL HELPER CLASS
//==================================================

class ChangedDecription
{
  public changed: symbol;
  public fieldName: string | undefined;

  public constructor(changed: symbol, fieldName?: string)
  {
    this.changed = changed;
    this.fieldName = fieldName;
  }
}
