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

export class Changes
{
  //==================================================
  // STATIC FIELDS: More will come here
  //==================================================

  // States changed
  public static readonly visibleState: symbol = Symbol("visibleState");
  public static readonly filter: symbol = Symbol("filter");
  public static readonly active: symbol = Symbol("active");
  public static readonly expanded: symbol = Symbol("expanded");
  public static readonly selected: symbol = Symbol("selected");

  // Fields changed
  public static readonly nodeName: symbol = Symbol("nodeName");
  public static readonly nodeColor: symbol = Symbol("nodeColor");
  public static readonly geometry: symbol = Symbol("geometry");
  public static readonly renderStyle: symbol = Symbol("renderStyle");

  // Parent-child relationship changed
  public static readonly childDeleted: symbol = Symbol("childDeleted");
  public static readonly childAdded: symbol = Symbol("childAdded");
  public static readonly pointOpenOrClosed: symbol = Symbol("pointOpenOrClosed");
}
