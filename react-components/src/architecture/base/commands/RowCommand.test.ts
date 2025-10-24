import { describe, expect, test } from 'vitest';
import { RowCommand, type RowCommandConfiguration } from './RowCommand';
import { MockCommand } from '#test-utils/architecture/mock-commands/MockCommand';

describe(RowCommand.name, () => {
  const createMockCommands = ({ count }: { count: number }): MockCommand[] => {
    return Array.from({ length: count }, () => new MockCommand());
  };
  const createRowCommand = (config: RowCommandConfiguration): RowCommand => {
    return new RowCommand(config);
  };

  test('should create RowCommand with valid configuration', () => {
    const commands = createMockCommands({ count: 3 });
    const config: RowCommandConfiguration = {
      commands
    };

    const rowCommand = createRowCommand(config);

    expect(rowCommand.commands).toEqual(commands);
    expect(rowCommand.hasCommands).toBe(true);
  });

  test('should create RowCommand with empty commands array', () => {
    const config: RowCommandConfiguration = {
      commands: []
    };

    const rowCommand = createRowCommand(config);

    expect(rowCommand.commands).toEqual([]);
    expect(rowCommand.hasCommands).toBe(false);
  });

  test('should return correct commands array and hasCommands property', () => {
    const commands = createMockCommands({ count: 3 });
    const rowCommand = createRowCommand({
      commands
    });

    expect(rowCommand.commands).toEqual(commands);
    expect(rowCommand.commands).toHaveLength(3);
    expect(rowCommand.hasCommands).toBe(true);

    const emptyRowCommand = createRowCommand({
      commands: []
    });

    expect(emptyRowCommand.hasCommands).toBe(false);
  });

  test('should be visible when at least one command is visible', () => {
    const visibleCommand = new MockCommand();
    visibleCommand.isVisible = true;

    const hiddenCommand = new MockCommand();
    hiddenCommand.isVisible = false;

    const rowCommand = createRowCommand({
      commands: [visibleCommand, hiddenCommand]
    });

    expect(rowCommand.isVisible).toBe(true);
  });

  test('should be hidden when all commands are hidden', () => {
    const hiddenCommand1 = new MockCommand();
    hiddenCommand1.isVisible = false;

    const hiddenCommand2 = new MockCommand();
    hiddenCommand2.isVisible = false;

    const rowCommand = createRowCommand({
      commands: [hiddenCommand1, hiddenCommand2]
    });

    expect(rowCommand.isVisible).toBe(false);
  });

  test('should be hidden when no commands exist', () => {
    const rowCommand = createRowCommand({
      commands: []
    });

    expect(rowCommand.isVisible).toBe(false);
  });

  test('should be visible when all commands are visible', () => {
    const visibleCommand1 = new MockCommand();
    visibleCommand1.isVisible = true;

    const visibleCommand2 = new MockCommand();
    visibleCommand2.isVisible = true;

    const rowCommand = createRowCommand({
      commands: [visibleCommand1, visibleCommand2]
    });

    expect(rowCommand.isVisible).toBe(true);
  });
});
