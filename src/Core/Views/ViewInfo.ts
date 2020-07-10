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

export class ViewInfo
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public items: TextItem[] = [];
  public footer: string = "";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public get isEmpty(): boolean
  {
    if (!Util.isEmpty(this.footer))
      return false;

    if (this.items.length > 0)
      return false;

    return true;
  }

  public addHeader(header: string) { this.items.push(new TextItem(header + ":")); }
  public addText(key: string, value: string) { this.items.push(new TextItem(key, value)); }
  public addNumber(key: string, value: number) { this.addText(key, value.toString()); }

  public clearItems(): void
  {
    this.items.splice(0, this.items.length);
  }
}

export class TextItem
{
  public key: string;
  public value: string | undefined;

  public dx = 0;
  public dy = 0;
  public isMultiLine = false;

  constructor(key: string, value?: string)
  {
    this.key = key;
    this.value = value;
  }

  public get isEmpty(): boolean { return Util.isEmpty(this.key); }
}

