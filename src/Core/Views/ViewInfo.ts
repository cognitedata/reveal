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

export class ViewInfo
{
  //==================================================
  // FIELDS
  //==================================================

  private _texts: TextViewInfo[] = [];

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public get isEmpty(): boolean
  {
    if (this._texts.length > 0)
      return false;
    return true;
  }

  public addText(text: string, priority: number = 1)
  {
    this._texts.push(new TextViewInfo(text, priority));
  }

  public postProcess(): void
  {
    this._texts.sort((a, b) => a.compareTo(b));
  }

  public clear(): void
  {
    this._texts.splice(0, this._texts.length);
  }

  public get text(): string
  {
    const delimiter = " ";
    let result = "";
    for (const text of this._texts)
    {
      if (text.isEmpty)
        continue;
      if (result.length > 0)
        result += delimiter;
      result += text.text;
    }
    return result;
  }  
}

class TextViewInfo
{
  public text: string;
  public priority: number;

  constructor(text: string, priority: number)
  {
    this.text = text;
    this.priority = priority;
  }

  public compareTo(other: TextViewInfo): number
  {
    if (this.priority > other.priority)
      return 1;
    if (this.priority < other.priority)
      return -1;
    return 0;
  }
  public get isEmpty(): boolean { return !this.text || this.text.length === 0; }
}

