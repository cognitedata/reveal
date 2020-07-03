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

import { Units } from "@/Core/Primitives/Units";

export class Util
{
  public static isEmpty(value: string | null | undefined): boolean { return !value || value.length === 0; }
  public static equalsIgnoreCase(value1: string, value2: string): boolean { return value1.toLowerCase() === value2.toLowerCase(); }

  public static cocatinate(name: string, value?: any): string
  {
    if (value === undefined || value === null)
      return ", " + name;
    return ", " + name + ": " + value;
  }

  public static isNumber(text: string): boolean
  {
    const value = Number(text);
    return !Number.isNaN(value);
  }

  public static getNumber(text: string): number
  {
    const value = Number(text);
    if (Number.isNaN(value))
    {
      console.warn("not a number");
      return value;
    }
    return value;
  }

  public static getNumberWithUnit(text: string, unit: string): number
  {
    let value = Util.getNumber(text);
    if (Number.isNaN(value))
      return value;

    if (Units.isFeet(unit))
      value *= Units.Feet;

    return value;
  }
}

