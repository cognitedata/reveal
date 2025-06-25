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
  test('Should install toolbars for the following tools', () => {
    installToolbars();
    expect(getToolbarCount(new AnnotationsCreateTool())).toBe(5);
    expect(getToolbarCount(new AnnotationsSelectTool())).toBe(6);
    expect(getToolbarCount(new ClipTool())).toBe(11);
    expect(getToolbarCount(new ExampleTool())).toBe(5);
    expect(getToolbarCount(new MeasurementTool())).toBe(10);
  });

  test('Should not install toolbar for navigation ', () => {
    installToolbars();
    expect(getToolbarCount(new NavigationTool())).toBe(0);
  });
});

function getToolbarCount(tool: BaseTool): number {
  const toolbar = tool.getToolbar();
  if (toolbar === undefined) {
    return 0;
  }
  return count(toolbar, (command) => command !== undefined);
}
