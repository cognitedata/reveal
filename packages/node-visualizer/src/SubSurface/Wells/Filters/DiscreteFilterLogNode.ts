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

import { Range1 } from '../../../Core/Geometry/Range1';
import { TargetId } from '../../../Core/Primitives/TargetId';
import { BasePropertyFolder } from '../../../Core/Property/Base/BasePropertyFolder';
import { BaseRenderStyle } from '../../../Core/Styles/BaseRenderStyle';
import DiscreteLogNodeIcon from '../../../images/Nodes/DiscreteLogNode.png';
import { BaseFilterLogNode } from '../../Wells/Filters/BaseFilterLogNode';
import { WellLogType } from '../../Wells/Logs/WellLogType';
import { DiscreteLogNode } from '../../Wells/Nodes/DiscreteLogNode';
import { DiscreteLogStyle } from '../../Wells/Styles/DiscreteLogStyle';

export class DiscreteFilterLogNode extends BaseFilterLogNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'DiscreteFilterLogNode';

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get renderStyle(): DiscreteLogStyle | null {
    return this.getRenderStyle() as DiscreteLogStyle;
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
    return DiscreteFilterLogNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return (
      className === DiscreteFilterLogNode.className || super.isA(className)
    );
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public get /* override */ typeName(): string {
    return 'DiscreteLog';
  }

  public /* override */ getIcon(): string {
    return DiscreteLogNodeIcon;
  }

  public /* override */ canChangeColor(): boolean {
    return false;
  }

  public /* override */ createRenderStyle(
    targetId: TargetId
  ): BaseRenderStyle | null {
    return new DiscreteLogStyle(targetId);
  }

  protected /* override */ populateStatisticsCore(
    folder: BasePropertyFolder
  ): void {
    super.populateStatisticsCore(folder);
    folder.addReadOnlyRange1('Values', this.getValueRange());
  }

  //= =================================================
  // OVERRIDES of BaseLogNode
  //= =================================================

  public get /* override */ wellLogType(): WellLogType {
    return WellLogType.Discrete;
  }

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public getValueRange(): Range1 {
    const valueRange = new Range1();
    for (const logNode of this.getAllLogs()) {
      if (!(logNode instanceof DiscreteLogNode)) continue;

      // if (!logNode.hasDataInMemory)
      //   continue;
      const { log } = logNode;
      if (!log) continue;

      valueRange.addRange(log.valueRange);
    }
    return valueRange;
  }
}
