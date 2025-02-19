/*!
 * Copyright 2023 Cognite AS
 */

import { AlignSelectedAnnotationCommand } from './concrete/annotations/commands/AnnotationsAlignCommand';
import { AnnotationsCreateMockCommand } from './concrete/annotations/commands/AnnotationsCreateMockCommand';
import { AnnotationsCreateTool } from './concrete/annotations/commands/AnnotationsCreateTool';
import { AnnotationsDeleteCommand } from './concrete/annotations/commands/AnnotationsDeleteCommand';
import { AnnotationsSelectTool } from './concrete/annotations/commands/AnnotationsSelectTool';
import { AnnotationsSetCreateTypeCommand } from './concrete/annotations/commands/AnnotationsSetCreateTypeCommand';
import { ApplyClipCommand } from './concrete/clipping/commands/ApplyClipCommand';
import { ClipTool } from './concrete/clipping/ClipTool';
import { DeleteAllExamplesCommand } from './concrete/example/commands/DeleteAllExamplesCommand';
import { ExampleTool } from './concrete/example/ExampleTool';
import { installToolbar } from './base/commands/factory/ToolbarFactory';
import { MeasurementTool } from './concrete/measurements/MeasurementTool';
import { NextOrPrevClippingCommand } from './concrete/clipping/commands/NextClippingCommand';
import { PrimitiveType } from './base/utilities/primitives/PrimitiveType';
import { ResetAllExamplesCommand } from './concrete/example/commands/ResetAllExamplesCommand';
import { SetClipTypeCommand } from './concrete/clipping/commands/SetClipTypeCommand';
import { SetMeasurementTypeCommand } from './concrete/measurements/commands/SetMeasurementTypeCommand';
import { ShowAllClippingCommand } from './concrete/clipping/commands/ShowAllClippingCommand';
import { ShowAllExamplesCommand } from './concrete/example/commands/ShowAllExamplesCommand';
import { ShowClippingOnTopCommand } from './concrete/clipping/commands/ShowClippingOnTopCommand';
import { ShowExamplesOnTopCommand } from './concrete/example/commands/ShowExamplesOnTopCommand';
import { ShowMeasurementsOnTopCommand } from './concrete/measurements/commands/ShowMeasurementsOnTopCommand';
import { UndoCommand } from './base/concreteCommands/UndoCommand';

export function installToolbars(): void {
  const separator = undefined;

  installToolbar(AnnotationsCreateTool, [
    new AnnotationsSelectTool(),
    new AnnotationsSetCreateTypeCommand(PrimitiveType.Box),
    new AnnotationsSetCreateTypeCommand(PrimitiveType.HorizontalCylinder),
    new AnnotationsSetCreateTypeCommand(PrimitiveType.VerticalCylinder),
    separator,
    new UndoCommand()
  ]);

  installToolbar(AnnotationsSelectTool, [
    new AnnotationsCreateTool(),
    new AnnotationsDeleteCommand(),
    new AlignSelectedAnnotationCommand(true),
    new AlignSelectedAnnotationCommand(false),
    new AnnotationsCreateMockCommand(),
    separator,
    new UndoCommand()
  ]);

  installToolbar(ClipTool, [
    new SetClipTypeCommand(PrimitiveType.PlaneX),
    new SetClipTypeCommand(PrimitiveType.PlaneY),
    new SetClipTypeCommand(PrimitiveType.PlaneZ),
    new SetClipTypeCommand(PrimitiveType.PlaneXY),
    new SetClipTypeCommand(PrimitiveType.Box),
    separator,
    new UndoCommand(),
    new ApplyClipCommand(),
    new NextOrPrevClippingCommand(false),
    new NextOrPrevClippingCommand(true),
    new ShowAllClippingCommand(),
    new ShowClippingOnTopCommand()
  ]);

  installToolbar(ExampleTool, [
    new UndoCommand(),
    new ResetAllExamplesCommand(),
    new ShowAllExamplesCommand(),
    new DeleteAllExamplesCommand(),
    new ShowExamplesOnTopCommand()
  ]);

  installToolbar(MeasurementTool, [
    new SetMeasurementTypeCommand(PrimitiveType.Line),
    new SetMeasurementTypeCommand(PrimitiveType.Polyline),
    new SetMeasurementTypeCommand(PrimitiveType.Polygon),
    new SetMeasurementTypeCommand(PrimitiveType.HorizontalArea),
    new SetMeasurementTypeCommand(PrimitiveType.VerticalArea),
    new SetMeasurementTypeCommand(PrimitiveType.Box),
    new SetMeasurementTypeCommand(PrimitiveType.VerticalCylinder),
    new SetMeasurementTypeCommand(PrimitiveType.HorizontalCircle),
    separator,
    new UndoCommand(),
    new ShowMeasurementsOnTopCommand()
  ]);
}
