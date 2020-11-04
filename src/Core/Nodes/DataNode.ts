//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { IDataLoader } from "@/Core/Interfaces/IDataLoader";
import { ITarget } from "@/Core/Interfaces/ITarget";
import Icon from "@images/Commands/Delete.png";
import { Changes } from "@/Core/Views/Changes";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { BasePropertyFolder } from "@/Core/Property/Base/BasePropertyFolder";

export abstract class DataNode extends BaseVisualNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = "DataNode";

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() { super(); }

  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private _data: any = null;

  private _dataIsLost?: boolean;

  private _dataLoader: IDataLoader | null = null;

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get dataLoader(): IDataLoader | null { return this._dataLoader; }

  public set dataLoader(value: IDataLoader | null) { this._dataLoader = value; }

  public get hasDataInMemory(): boolean { return this._data != null; }

  public get dataIsLost(): boolean { return this._dataIsLost === undefined ? false : this._dataIsLost; }

  protected get anyData(): any {
    if (this._data != null || this.dataIsLost)
      return this._data;

    if (!this.dataLoader)
      return null;

    const data = this.dataLoader.load(this);
    this.anyData = data;
    return data;
  }

  protected set anyData(value: any) {
    this._data = value;
    const dataWasLost = this._dataIsLost;
    this._dataIsLost = !value;
    if (dataWasLost !== this._dataIsLost)
      this.notify(new NodeEventArgs(Changes.nodeIcon));

    if (!this.dataIsLost)
      return;

    // tslint:disable-next-line:no-console
    console.warn("The data is lost in", this.name);
    this.notify(new NodeEventArgs(Changes.visibleState));
    this.notify(new NodeEventArgs(Changes.nodeIcon));
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public /* override */ get className(): string { return DataNode.className; }

  public /* override */ isA(className: string): boolean { return className === DataNode.className || super.isA(className); }

  //= =================================================
  // OVERRIDES of BaseVisualNode
  //= =================================================

  public /* override */ getIcon(): string { return Icon; }

  public /* override */ canBeVisible(target?: ITarget | null): boolean {
    if (this.dataIsLost)
      return false;
    return super.canBeVisible(target);
  }

  public /* override */ canBeVisibleNow(): boolean { return this.anyData != null; }

  protected /* override */ populateStatisticsCore(folder: BasePropertyFolder): void {
    super.populateStatisticsCore(folder);
    if (this.dataIsLost)
      folder.addReadOnlyString("Status", "Load error");
  }
}