/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../src/architecture/base/commands/BaseCommand';
import { SetTerrainVisibleCommand } from '../../src/architecture/concrete/terrain/SetTerrainVisibleCommand';
import { UpdateTerrainCommand } from '../../src/architecture/concrete/terrain/UpdateTerrainCommand';
import { FitViewCommand } from '../../src/architecture/base/concreteCommands/FitViewCommand';
import { SetAxisVisibleCommand } from '../../src/architecture/concrete/axis/SetAxisVisibleCommand';
import { ExampleTool } from '../../src/architecture/concrete/example/ExampleTool';
import { AxisGizmoTool } from '@cognite/reveal/tools';
import { BaseRevealConfig } from '../../src/architecture/base/renderTarget/BaseRevealConfig';
import { type RevealRenderTarget } from '../../src/architecture/base/renderTarget/RevealRenderTarget';
import { NavigationTool } from '../../src/architecture/base/concreteCommands/NavigationTool';
import { type BaseTool } from '../../src/architecture/base/commands/BaseTool';
import { ToggleMetricUnitsCommand } from '../../src/architecture/base/concreteCommands/ToggleMetricUnitsCommand';
import { MeasurementTool } from '../../src/architecture/concrete/measurements/MeasurementTool';
import { ClipTool } from '../../src/architecture/concrete/clipping/ClipTool';
import { KeyboardSpeedCommand } from '../../src/architecture/base/concreteCommands/KeyboardSpeedCommand';
import { SettingsCommand } from '../../src/architecture/base/concreteCommands/SettingsCommand';
import { MockSettingsCommand } from '#test-utils/architecture/mock-commands/MockSettingsCommand';
import { MockFilterCommand } from '#test-utils/architecture/mock-commands/MockFilterCommand';
import { ToggleAllModelsVisibleCommand } from '../../src/architecture/base/concreteCommands/ToggleAllModelsVisibleCommand';
import { SetOrbitOrFirstPersonModeCommand } from '../../src/architecture/base/concreteCommands/SetOrbitOrFirstPersonModeCommand';

import { AnnotationsCreateTool } from '../../src/architecture/concrete/annotations/commands/AnnotationsCreateTool';
import { AnnotationsShowCommand } from '../../src/architecture/concrete/annotations/commands/AnnotationsShowCommand';
import { AnnotationsShowOnTopCommand } from '../../src/architecture/concrete/annotations/commands/AnnotationsShowOnTopCommand';
import { AnnotationsSelectTool } from '../../src/architecture/concrete/annotations/commands/AnnotationsSelectTool';
import { PointsOfInterestTool } from '../../src/architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { Image360ActionCommand } from '../../src/architecture/base/concreteCommands/image360Collection/Image360ActionCommand';
import { Image360Action } from '@cognite/reveal';
import { type ExternalId } from '../../src/data-providers/FdmSDK';
import { Image360AnnotationSelectTool } from '../../src/architecture/concrete/annotation360/Image360AnnotationSelectTool';
import { Image360AnnotationCreateTool } from '../../src/architecture/concrete/annotation360/Image360AnnotationCreateTool';
import { ShowTreeViewCommand } from '../../src/architecture/base/concreteCommands/ShowTreeViewCommand';

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
      new Image360AnnotationSelectTool(false),
      new Image360AnnotationCreateTool(false),
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
