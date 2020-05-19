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

import { UniqueId } from "@/Core/PrimitiveClasses/UniqueId";
import { RenderStyleResolution } from "@/Core/Enums/RenderStyleResolution";

export class TargetId
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(typeName: string, uniqueId: UniqueId)
  {
    this._typeName = typeName;
    this._uniqueId = uniqueId;
  }

  public /*copy constructor*/ copy(): TargetId { return new TargetId(this.typeName, this.uniqueId); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _typeName: string;
  private _uniqueId: UniqueId;
  public static empty = new TargetId("", UniqueId.empty);

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get typeName(): string { return this._typeName; }
  public set typeName(value: string) { this._typeName = value; }
  public get uniqueId(): UniqueId { return this._uniqueId; }
  public set uniqueId(value: UniqueId) { this._uniqueId = value; }
  public get isEmpty(): boolean { return this.typeName === "" && this.uniqueId.isEmpty; }

  public /*override*/ toString(): string { return `(${this.typeName}, ${this.uniqueId})`; }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  public hasSameTypeName(targetId: TargetId): boolean { return this.typeName === targetId.typeName; }
  public hasSameUniqueId(targetId: TargetId): boolean { return this.uniqueId.equals(targetId.uniqueId); }

  public equals(targetIdOnTargetNode: TargetId, renderStyleResolution: RenderStyleResolution): boolean
  {
    switch (renderStyleResolution)
    {
      case RenderStyleResolution.Global:
        return this.isEmpty;

      case RenderStyleResolution.Target:
        return this.hasSameTypeName(targetIdOnTargetNode);

      case RenderStyleResolution.Unique:
        const result = this.hasSameUniqueId(targetIdOnTargetNode);
        if (!this.hasSameTypeName(targetIdOnTargetNode))
          throw Error("The TypeName should be equal");
        return result;

      default:
        throw Error(renderStyleResolution);
    }
  }

  //==================================================
  // INSTANCE METHODS: Setters
  //==================================================

  public set(id: TargetId, renderStyleResolution: RenderStyleResolution): void
  {
    switch (renderStyleResolution)
    {
      case RenderStyleResolution.Global:
        this.typeName = "";
        this.uniqueId = UniqueId.empty;
        break;

      case RenderStyleResolution.Target:
        this.typeName = id.typeName;
        this.uniqueId = UniqueId.empty;
        break;

      case RenderStyleResolution.Unique:
        this.uniqueId = id.uniqueId;
        this.typeName = id.typeName;
        break;

      default:
        throw Error(renderStyleResolution);
    }
  }
}

