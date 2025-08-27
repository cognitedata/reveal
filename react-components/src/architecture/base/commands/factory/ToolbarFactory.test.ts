import { describe, expect, test, beforeAll } from 'vitest';
import { hasToolbar, getToolbar, installToolbar } from './ToolbarFactory';
import { BaseTool } from '../BaseTool';
import { BaseCommand } from '../BaseCommand';

describe('ToolbarFactory', () => {
  beforeAll(() => {
    installToolbar(FooTool, [new FooCommand(), new FooCommand()]);
  });

  test('should test has a toolbar', () => {
    const tool = new FooTool();
    expect(hasToolbar(tool)).toBe(true);
  });

  test('should test has not a toolbar', () => {
    const tool = new BarTool();
    expect(hasToolbar(tool)).toBe(false);
  });

  test('should test get toolbar', () => {
    const tool = new FooTool();
    const toolBar = getToolbar(tool);
    expect(toolBar).toBeDefined();
    if (toolBar !== undefined) {
      expect(toolBar.length).toEqual(2);
    }
  });

  test('should test can not get toolbar', () => {
    const tool = new BarTool();
    expect(getToolbar(tool)).toBeUndefined();
  });
});

class FooTool extends BaseTool {}
class BarTool extends BaseTool {}
class FooCommand extends BaseCommand {}
