/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
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
import { SettingsCommand } from '../../base/concreteCommands/SettingsCommand';
import { MockSettingsCommand } from '../../base/commands/mocks/MockSettingsCommand';
import { MockFilterCommand } from '../../base/commands/mocks/MockFilterCommand';
import { ToggleAllModelsVisibleCommand } from '../../base/concreteCommands/ToggleAllModelsVisibleCommand';
import { SetOrbitOrFirstPersonModeCommand } from '../../base/concreteCommands/SetOrbitOrFirstPersonModeCommand';

import { AnnotationsCreateTool } from '../annotations/commands/AnnotationsCreateTool';
import { AnnotationsShowCommand } from '../annotations/commands/AnnotationsShowCommand';
import { AnnotationsShowOnTopCommand } from '../annotations/commands/AnnotationsShowOnTopCommand';
import { AnnotationsSelectTool } from '../annotations/commands/AnnotationsSelectTool';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { PointsOfInterestTool } from '../pointsOfInterest/PointsOfInterestTool';

export class StoryBookConfig extends BaseRevealConfig {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override createDefaultTool(): BaseTool {
    return new NavigationTool();
  }

  public override createTopToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetOrbitOrFirstPersonModeCommand(),
      new FitViewCommand(),
      new SetAxisVisibleCommand(),
      new KeyboardSpeedCommand()
    ];
  }

  public override createMainToolbar(): Array<BaseCommand | undefined> {
    return [
      new MockSettingsCommand(),
      new ToggleAllModelsVisibleCommand(),
      new ToggleMetricUnitsCommand(),
      new SettingsCommand(),
      undefined,
      new MeasurementTool(),
      new ClipTool(),
      new PointsOfInterestTool<DmsUniqueIdentifier>(),
      undefined,
      new AnnotationsSelectTool(),
      new AnnotationsCreateTool(),
      new AnnotationsShowCommand(),
      new AnnotationsShowOnTopCommand(),
      undefined,
      new ExampleTool(),
      new SetTerrainVisibleCommand(),
      new UpdateTerrainCommand(),
      undefined,
      new MockSettingsCommand(),
      new MockFilterCommand()
    ];
  }

  public override createAxisGizmoTool(): AxisGizmoTool | undefined {
    return new AxisGizmoTool();
  }

  public override onStartup(renderTarget: RevealRenderTarget): void {
    renderTarget.fitView();
  }
}
