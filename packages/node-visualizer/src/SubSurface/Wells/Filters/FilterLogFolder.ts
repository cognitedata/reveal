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

import { ITarget } from '../../../Core/Interfaces/ITarget';
import { BaseNode } from '../../../Core/Nodes/BaseNode';
import FilterLogFolderIcon from '../../../images/Nodes/FilterLogFolder.png';
import { BaseFilterLogNode } from '../../Wells/Filters/BaseFilterLogNode';
import { CasingFilterLogNode } from '../../Wells/Filters/CasingFilterLogNode';
import { DiscreteFilterLogNode } from '../../Wells/Filters/DiscreteFilterLogNode';
import { FloatFilterLogNode } from '../../Wells/Filters/FloatFilterLogNode';
import { PointFilterLogNode } from '../../Wells/Filters/PointFilterLogNode';
import { BaseLogNode } from '../../Wells/Nodes/BaseLogNode';
import { CasingLogNode } from '../../Wells/Nodes/CasingLogNode';
import { DiscreteLogNode } from '../../Wells/Nodes/DiscreteLogNode';
import { FloatLogNode } from '../../Wells/Nodes/FloatLogNode';
import { PointLogNode } from '../../Wells/Nodes/PointLogNode';

export class FilterLogFolder extends BaseNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'FilterLogFolder';

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
    return FilterLogFolder.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === FilterLogFolder.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public get /* override */ typeName(): string {
    return 'Log filter';
  }

  public /* override */ getIcon(): string {
    return FilterLogFolderIcon;
  }

  public /* override */ canChangeName(): boolean {
    return false;
  }

  public /* override */ canChangeColor(): boolean {
    return false;
  }

  public /* override */ isLabelInItalic(): boolean {
    return true;
  }

  public /* override */ isFilter(_target: ITarget | null): boolean {
    return true;
  }

  public /* override */ canBeChecked(_target: ITarget | null): boolean {
    return false;
  }

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public getFilterLogNode(logNode: BaseLogNode): BaseFilterLogNode | null {
    for (const filterLogNode of this.getChildrenByType(BaseFilterLogNode)) {
      if (logNode.isEqual(filterLogNode)) return filterLogNode;
    }
    return null;
  }

  public synchronize(): void {
    const treeNode = this.getTreeNode();
    if (!treeNode) return;

    // Iterate over all logs
    for (const logNode of treeNode.getDescendantsByType(BaseLogNode)) {
      let filterLogNode = this.getFilterLogNode(logNode);
      if (filterLogNode) continue;

      filterLogNode = this.createFilterLogNode(logNode);
      if (!filterLogNode) continue;

      filterLogNode.name = logNode.name;
      this.addChild(filterLogNode);
      filterLogNode.initialize();
    }
    this.sortChildrenByName();
  }

  private createFilterLogNode(logNode: BaseLogNode): BaseFilterLogNode | null {
    if (logNode instanceof CasingLogNode) return new CasingFilterLogNode();
    if (logNode instanceof DiscreteLogNode) return new DiscreteFilterLogNode();
    if (logNode instanceof FloatLogNode) return new FloatFilterLogNode();
    if (logNode instanceof PointLogNode) return new PointFilterLogNode();
    Error('Can not FilterLogNode');
    return null;
  }
}
