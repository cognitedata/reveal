import { describe, expect, test } from 'vitest';
import { RowCommand } from './RowCommand';
import { MockCommand } from '#test-utils/architecture/mock-commands/MockCommand';
import { MockActionCommand } from '#test-utils/architecture/mock-commands/MockActionCommand';
import { MockToggleCommand } from '#test-utils/architecture/mock-commands/MockToggleCommand';
import { MockCheckableCommand } from '#test-utils/architecture/mock-commands/MockCheckableCommand';
import { BaseCommand } from './BaseCommand';

// Custom mock commands for testing visibility
class MockCommand1 extends MockCommand {}
class MockCommand2 extends MockCommand {}

describe(RowCommand.name, () => {
  const createMockCommands = (): BaseCommand[] => {
    return [
      new MockCommand(),
      new MockActionCommand(),
      new MockToggleCommand(),
      new MockCheckableCommand()
    ];
  };
  const createRowCommand = (commands: BaseCommand[]): RowCommand => {
    const rowCommand = new RowCommand();
    commands.forEach((command) => rowCommand.add(command));
    return rowCommand;
  };

  test('should create RowCommand with valid configuration', () => {
    const commands = createMockCommands();

    const rowCommand = createRowCommand(commands);

    expect(rowCommand.commands).toEqual(commands);
    expect(rowCommand.hasCommands).toBe(true);
  });

  test('should create RowCommand with empty commands array', () => {
    const rowCommand = createRowCommand([]);

    expect(rowCommand.commands).toEqual([]);
    expect(rowCommand.hasCommands).toBe(false);
  });

  test('should return correct commands array and hasCommands property', () => {
    const commands = createMockCommands();
    const rowCommand = createRowCommand(commands);

    expect(rowCommand.commands).toEqual(commands);
    expect(rowCommand.commands).toHaveLength(4);
    expect(rowCommand.hasCommands).toBe(true);

    const emptyRowCommand = createRowCommand([]);

    expect(emptyRowCommand.hasCommands).toBe(false);
  });

  test('should be visible when at least one command is visible', () => {
    const visibleCommand = new MockCommand1();
    visibleCommand.isVisible = true;

    const hiddenCommand = new MockCommand2();
    hiddenCommand.isVisible = false;

    const rowCommand = createRowCommand([visibleCommand, hiddenCommand]);

    expect(rowCommand.isVisible).toBe(true);
  });

  test('should be hidden when all commands are hidden', () => {
    const hiddenCommand1 = new MockCommand1();
    hiddenCommand1.isVisible = false;

    const hiddenCommand2 = new MockCommand2();
    hiddenCommand2.isVisible = false;

    const rowCommand = createRowCommand([hiddenCommand1, hiddenCommand2]);

    expect(rowCommand.isVisible).toBe(false);
  });

  test('should be hidden when no commands exist', () => {
    const rowCommand = createRowCommand([]);

    expect(rowCommand.isVisible).toBe(false);
  });

  test('should be visible when all commands are visible', () => {
    const visibleCommand1 = new MockCommand1();
    visibleCommand1.isVisible = true;

    const visibleCommand2 = new MockCommand2();
    visibleCommand2.isVisible = true;

    const rowCommand = createRowCommand([visibleCommand1, visibleCommand2]);

    expect(rowCommand.isVisible).toBe(true);
  });
});
