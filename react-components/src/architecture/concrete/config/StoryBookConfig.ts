/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';
import { SetTerrainVisibleCommand } from '../terrain/SetTerrainVisibleCommand';
import { UpdateTerrainCommand } from '../terrain/UpdateTerrainCommand';
import { FitViewCommand } from '../../base/concreteCommands/FitViewCommand';
import { SetAxisVisibleCommand } from '../axis/SetAxisVisibleCommand';
import { ExampleTool } from '../example/ExampleTool';
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { BaseRevealConfig } from '../../base/renderTarget/BaseRevealConfig';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { type BaseTool } from '../../base/commands/BaseTool';
import { ToggleMetricUnitsCommand } from '../../base/concreteCommands/ToggleMetricUnitsCommand';
import { MeasurementTool } from '../measurements/MeasurementTool';
import { ClipTool } from '../clipping/ClipTool';
import { KeyboardSpeedCommand } from '../../base/concreteCommands/KeyboardSpeedCommand';
import { ObservationsTool } from '../observations/ObservationsTool';
import { SettingsCommand } from '../../base/concreteCommands/SettingsCommand';
import { MockSettingsCommand } from '../../base/commands/mocks/MockSettingsCommand';
import { MockFilterCommand } from '../../base/commands/mocks/MockFilterCommand';
import { ToggleAllModelsVisibleCommand } from '../../base/concreteCommands/ToggleAllModelsVisibleCommand';
import { SetOrbitOrFirstPersonModeCommand } from '../../base/concreteCommands/SetOrbitOrFirstPersonModeCommand';

export class StoryBookConfig extends BaseRevealConfig {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override createDefaultTool(): BaseTool {
    return new NavigationTool();
  }

  public override createMainToolbar(): Array<BaseCommand | undefined> {
    return [
      new ToggleAllModelsVisibleCommand(),
      new ToggleMetricUnitsCommand(),
      new KeyboardSpeedCommand(),
      new SettingsCommand(),
      new MockSettingsCommand(),
      new MockFilterCommand(),
      undefined,
      new ExampleTool(),
      new MeasurementTool(),
      new ClipTool(),
      new ObservationsTool(),
      undefined,
      new SetTerrainVisibleCommand(),
      new UpdateTerrainCommand(),
      undefined
    ];
  }

  public override createTopToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetOrbitOrFirstPersonModeCommand(),
      new FitViewCommand(),
      new SetAxisVisibleCommand(),
      new KeyboardSpeedCommand()
    ];
  }

  public override createTopToolbarStyle(): PopupStyle {
    return new PopupStyle({ left: 0, top: 0, horizontal: true });
  }

  public override createAxisGizmoTool(): AxisGizmoTool | undefined {
    return new AxisGizmoTool();
  }

  public override onStartup(renderTarget: RevealRenderTarget): void {
    renderTarget.fitView();
  }
}
