import { describe, expect, test } from 'vitest';
import { AnnotationsCreateTool } from './concrete/annotations/commands/AnnotationsCreateTool';
import { AnnotationsSelectTool } from './concrete/annotations/commands/AnnotationsSelectTool';
import { ClipTool } from './concrete/clipping/ClipTool';
import { count } from './base/utilities/extensions/arrayExtensions';
import { ExampleTool } from './concrete/example/ExampleTool';
import { MeasurementTool } from './concrete/measurements/MeasurementTool';
import { installToolbars } from './installToolbars';
import { type BaseTool } from './base/commands/BaseTool';
import { NavigationTool } from './base/concreteCommands/NavigationTool';

describe(installToolbars.name, () => {
  test('Should have toolbars with correct number of commands for the following tools', () => {
    installToolbars();
    expect(getCommandsInToolbarCount(new AnnotationsCreateTool())).toBe(5);
    expect(getCommandsInToolbarCount(new AnnotationsSelectTool())).toBe(6);
    expect(getCommandsInToolbarCount(new ClipTool())).toBe(11);
    expect(getCommandsInToolbarCount(new ExampleTool())).toBe(5);
    expect(getCommandsInToolbarCount(new MeasurementTool())).toBe(10);
  });

  test('Should not install toolbar for navigation ', () => {
    installToolbars();
    expect(getCommandsInToolbarCount(new NavigationTool())).toBe(0);
  });
});

function getCommandsInToolbarCount(tool: BaseTool): number {
  const toolbar = tool.getToolbar();
  if (toolbar === undefined) {
    return 0;
  }
  return count(toolbar, (command) => command !== undefined);
}
