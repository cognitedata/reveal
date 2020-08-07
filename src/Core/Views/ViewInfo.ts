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

import { Util } from "@/Core/Primitives/Util";
import { TextItem } from "@/Core/Views/TextItem";
import { Polyline } from "@/Core/Geometry/Polyline";

export class ViewInfo
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public footer: string = "";
  public items: TextItem[] = [];
  public polyline: Polyline | null = null;

  //==================================================
  // INSTANCE METHODS: Request
  //==================================================

  public get isEmpty(): boolean
  {
    if (!Util.isEmpty(this.footer))
      return false;

    if (this.items.length > 0)
      return false;

    return true;
  }

  //==================================================
  // INSTANCE METHODS: Add operations
  //==================================================

  public addHeader(header: string) { this.items.push(new TextItem(`${header}:`)); }
  public addText(key: string, value?: string) { this.items.push(new TextItem(key, value)); }
  public addNumber(key: string, value: number) { this.addText(key, value.toString()); }
  public setPolyline(polyline: Polyline) { this.polyline = polyline; }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public clear(): void
  {
    this.items.splice(0, this.items.length);
    this.polyline = null;
  }
}
