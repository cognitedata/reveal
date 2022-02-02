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

import { BaseVisualNode } from 'Core/Nodes/BaseVisualNode';
import { FilterLogFolder } from 'SubSurface/Wells/Filters/FilterLogFolder';
import { WellLogType } from 'SubSurface/Wells/Logs/WellLogType';
import { BaseLogNode } from 'SubSurface/Wells/Nodes/BaseLogNode';
import { ITarget } from 'Core/Interfaces/ITarget';
import { BasePropertyFolder } from 'Core/Property/Base/BasePropertyFolder';
import { Changes } from 'Core/Views/Changes';
import { NodeEventArgs } from 'Core/Views/NodeEventArgs';

export abstract class BaseFilterLogNode extends BaseVisualNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'BaseFilterLogNode';

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get filterLogFolder(): FilterLogFolder | null {
    return this.getAncestorByType(FilterLogFolder);
  }

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() {
    super();
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public get /* override */ className(): string {
    return BaseFilterLogNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === BaseFilterLogNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public /* override */ isLabelInItalic(): boolean {
    return true;
  }

  public /* override */ isFilter(_target: ITarget | null): boolean {
    return true;
  }

  protected /* override */ populateStatisticsCore(
    folder: BasePropertyFolder
  ): void {
    super.populateStatisticsCore(folder);
    let count = 0;
    for (const _ of this.getAllLogs()) count += 1;

    folder.addReadOnlyInteger('# Logs of this type', count);
  }

  public /* override */ notifyCore(args: NodeEventArgs): void {
    super.notifyCore(args);
    if (
      !args.isChanged(Changes.renderStyle, Changes.nodeName, Changes.nodeColor)
    )
      return;

    for (const logNode of this.getAllLogs()) logNode.notify(args);
  }

  //= =================================================
  // VIRTUAL METHODS
  //= =================================================

  public abstract get wellLogType(): WellLogType;

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public *getAllLogs(): Generator<BaseLogNode> {
    const treeNode = this.getTreeNode();
    if (!treeNode) return;

    for (const logNode of treeNode.getDescendantsByType(BaseLogNode)) {
      if (logNode.filterLogNode === this) yield logNode;
    }
  }
}
