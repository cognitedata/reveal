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
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { BaseRevealConfig } from '../../base/renderTarget/BaseRevealConfig';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { type BaseTool } from '../../base/commands/BaseTool';
import { ToggleMetricUnitsCommand } from '../../base/concreteCommands/ToggleMetricUnitsCommand';
import { MeasurementTool } from '../measurements/MeasurementTool';
import { ClipTool } from '../clipping/ClipTool';

export class StoryBookConfig extends BaseRevealConfig {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override createDefaultTool(): BaseTool {
    return new NavigationTool();
  }

  public override createMainToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit),
      new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson),
      undefined,
      new FitViewCommand(),
      new SetAxisVisibleCommand(),
      new ToggleMetricUnitsCommand(),
      undefined,
      new ExampleTool(),
      new MeasurementTool(),
      new ClipTool(),
      undefined,
      new SetTerrainVisibleCommand(),
      new UpdateTerrainCommand()
    ];
  }

  public override createMainToolbarStyle(): PopupStyle {
    return new PopupStyle({ right: 0, top: 0, horizontal: false });
  }

  public override createAxisGizmoTool(): AxisGizmoTool | undefined {
    return new AxisGizmoTool();
  }

  public override onStartup(renderTarget: RevealRenderTarget): void {
    renderTarget.fitView();
  }
}
