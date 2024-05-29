/*!
 * Copyright 2024 Cognite AS
 */

import { FlexibleControlsType } from '@cognite/reveal';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';
import { SetFlexibleControlsTypeCommand } from '../../base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetTerrainVisibleCommand } from '../terrainDomainObject/SetTerrainVisibleCommand';
import { UpdateTerrainCommand } from '../terrainDomainObject/UpdateTerrainCommand';
import { FitViewCommand } from '../../base/concreteCommands/FitViewCommand';
import { SetAxisVisibleCommand } from '../axis/SetAxisVisibleCommand';
import { ExampleTool } from '../exampleDomainObject/ExampleTool';
import { MeasurementTool } from '../boxDomainObject/MeasurementTool';
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { BaseRevealConfig } from '../../base/renderTarget/BaseRevealConfig';

export class StoryBookConfig extends BaseRevealConfig {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override createMainToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit),
      new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson),
      undefined,
      new FitViewCommand(),
      new SetAxisVisibleCommand(),
      undefined,
      new SetTerrainVisibleCommand(),
      new UpdateTerrainCommand(),
      undefined,
      new ExampleTool(),
      new MeasurementTool()
    ];
  }

  public override createMainToolbarStyle(): PopupStyle {
    return new PopupStyle({ right: 0, top: 0, horizontal: false });
  }

  public override createAxisGizmoTool(): AxisGizmoTool | undefined {
    return new AxisGizmoTool();
  }
}
