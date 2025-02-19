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
import { PointsOfInterestTool } from '../pointsOfInterest/PointsOfInterestTool';
import { Image360ActionCommand } from '../../base/concreteCommands/image360Collection/Image360ActionCommand';
import { Image360Action } from '@cognite/reveal';
import { type ExternalId } from '../../../data-providers/FdmSDK';
import { Image360AnnotationSelectTool } from '../annotation360/Image360AnnotationSelectTool';
import { Image360AnnotationCreateTool } from '../annotation360/Image360AnnotationCreateTool';
import { ShowTreeViewCommand } from '../../base/concreteCommands/ShowTreeViewCommand';

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
      new KeyboardSpeedCommand(),
      undefined,
      new Image360ActionCommand(Image360Action.Enter),
      new Image360ActionCommand(Image360Action.Backward),
      new Image360ActionCommand(Image360Action.Forward),
      new Image360ActionCommand(Image360Action.Exit)
    ];
  }

  public override createMainToolbar(): Array<BaseCommand | undefined> {
    return [
      new ShowTreeViewCommand(),
      new ToggleAllModelsVisibleCommand(),
      new ToggleMetricUnitsCommand(),
      new SettingsCommand(),
      undefined,
      new Image360AnnotationSelectTool(),
      new Image360AnnotationCreateTool(),
      undefined,
      new MeasurementTool(),
      new ClipTool(),
      new PointsOfInterestTool<ExternalId>(),
      undefined,
      new MockSettingsCommand(),
      new MockFilterCommand(),
      undefined,
      new AnnotationsSelectTool(),
      new AnnotationsCreateTool(),
      new AnnotationsShowCommand(),
      new AnnotationsShowOnTopCommand(),
      undefined,
      new ExampleTool(),
      new SetTerrainVisibleCommand(),
      new UpdateTerrainCommand()
    ];
  }

  public override createAxisGizmoTool(): AxisGizmoTool | undefined {
    return new AxisGizmoTool();
  }

  public override onStartup(renderTarget: RevealRenderTarget): void {
    renderTarget.fitView();
  }
}
