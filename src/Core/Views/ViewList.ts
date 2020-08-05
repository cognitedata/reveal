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

import { BaseView } from "@/Core/Views/BaseView";
import { ITargetIdAccessor } from "@/Core/Interfaces/ITargetIdAccessor";

export class ViewList
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public list: BaseView[] = [];

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get count(): number { return this.list.length; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public add(view: BaseView): void
  {
    this.list.push(view);
  }

  public remove(view: BaseView): boolean
  {
    const index = this.list.indexOf(view, 0);
    if (index < 0)
      return false;

    this.list.splice(index, 1);
    return true;
  }

  public clear(): void
  {
    this.list.splice(0, this.list.length);
  }

  public getViewByTarget(target: ITargetIdAccessor): BaseView | null
  {
    const resultView = this.list.find((view: BaseView) => view.getTarget() === target);
    return resultView === undefined ? null : resultView;
  }

  public isOk(): boolean
  {
    // Used in unit testing
    for (const view of this.list)
      if (!view.verify())
        return false;
    return true;
  }
}
