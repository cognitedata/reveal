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

export enum ColorType
{
  Specified, // Use the color of the node
  Parent, // Use the color of the parent node
  Black,
  White,
  DepthColor, // Color by the Z value, using a color table
  ModelColor, // Use the color in the model or the texture if any
  DifferentColor, // Use different colors (normally use for debugging)
  TreeDepthColor, // Use different color for each depth if the data has tiles or somehow sorted in a tree
};
