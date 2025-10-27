import { describe, expect, test } from 'vitest';
import { GroupCommand } from './GroupCommand';
import { MockCommand } from '#test-utils/architecture/mock-commands/MockCommand';
import { MockActionCommand } from '#test-utils/architecture/mock-commands/MockActionCommand';
import { MockToggleCommand } from '#test-utils/architecture/mock-commands/MockToggleCommand';
import { MockCheckableCommand } from '#test-utils/architecture/mock-commands/MockCheckableCommand';
import { BaseCommand } from './BaseCommand';

// Custom mock commands for testing visibility
class MockCommand1 extends MockCommand {}
class MockCommand2 extends MockCommand {}

describe(GroupCommand.name, () => {
  const createMockCommands = (): BaseCommand[] => {
    return [
      new MockCommand(),
      new MockActionCommand(),
      new MockToggleCommand(),
      new MockCheckableCommand()
    ];
  };
  const createGroupCommand = (title: string, commands: BaseCommand[]): GroupCommand => {
    const groupCommand = new GroupCommand({ untranslated: title }, true);
    commands.forEach((command) => groupCommand.add(command));
    return groupCommand;
  };

  const createRowCommand = (commands: BaseCommand[]): GroupCommand => {
    const groupCommand = new GroupCommand(undefined, false);
    commands.forEach((command) => groupCommand.add(command));
    return groupCommand;
  };

  test('should create GroupCommand with valid configuration', () => {
    const commands = createMockCommands();

    const groupCommand = createGroupCommand('Test Group', commands);

    expect(groupCommand.title).toEqual({ untranslated: 'Test Group' });
    expect(groupCommand.commands).toEqual(commands);
    expect(groupCommand.hasCommands).toBe(true);
  });

  test('should create GroupCommand with empty commands array', () => {
    const groupCommand = createGroupCommand('Empty Group', []);

    expect(groupCommand.title).toEqual({ untranslated: 'Empty Group' });
    expect(groupCommand.commands).toEqual([]);
    expect(groupCommand.hasCommands).toBe(false);
  });

  test('should return correct title', () => {
    const commands = createMockCommands();
    const groupCommand = createGroupCommand('My Group Title', commands);

    expect(groupCommand.title).toEqual({ untranslated: 'My Group Title' });
  });

  test('should return correct commands array', () => {
    const commands = createMockCommands();
    const groupCommand = createGroupCommand('Test', commands);

    expect(groupCommand.commands).toEqual(commands);
    expect(groupCommand.commands).toHaveLength(4);
  });

  test('should return hasCommands correctly', () => {
    const commandsWithItems = createMockCommands();
    const groupWithCommands = createGroupCommand('With Commands', commandsWithItems);

    const groupWithoutCommands = createGroupCommand('Without Commands', []);

    expect(groupWithCommands.hasCommands).toBe(true);
    expect(groupWithoutCommands.hasCommands).toBe(false);
  });

  test('should be visible when at least one command is visible', () => {
    const visibleCommand = new MockCommand1();
    visibleCommand.isVisible = true;

    const hiddenCommand = new MockCommand2();
    hiddenCommand.isVisible = false;

    const groupCommand = createGroupCommand('Mixed Visibility', [visibleCommand, hiddenCommand]);

    expect(groupCommand.isVisible).toBe(true);
  });

  test('should be hidden when all commands are hidden', () => {
    const hiddenCommand1 = new MockCommand1();
    hiddenCommand1.isVisible = false;

    const hiddenCommand2 = new MockCommand2();
    hiddenCommand2.isVisible = false;

    const groupCommand = createGroupCommand('All Hidden', [hiddenCommand1, hiddenCommand2]);

    expect(groupCommand.isVisible).toBe(false);
  });

  test('should be hidden when no commands exist', () => {
    const groupCommand = createGroupCommand('No Commands', []);

    expect(groupCommand.isVisible).toBe(false);
  });

  test('should be visible when all commands are visible', () => {
    const visibleCommand1 = new MockCommand1();
    visibleCommand1.isVisible = true;

    const visibleCommand2 = new MockCommand2();
    visibleCommand2.isVisible = true;

    const groupCommand = createGroupCommand('All Visible', [visibleCommand1, visibleCommand2]);

    expect(groupCommand.isVisible).toBe(true);
  });

  // Tests for row functionality (isAccordion = false)
  test('should create row command without title', () => {
    const commands = createMockCommands();
    const rowCommand = createRowCommand(commands);

    expect(rowCommand.title).toBeUndefined();
    expect(rowCommand.isAccordion).toBe(false);
    expect(rowCommand.commands).toEqual(commands);
    expect(rowCommand.hasCommands).toBe(true);
  });

  test('should create row command with empty commands', () => {
    const rowCommand = createRowCommand([]);

    expect(rowCommand.title).toBeUndefined();
    expect(rowCommand.isAccordion).toBe(false);
    expect(rowCommand.commands).toEqual([]);
    expect(rowCommand.hasCommands).toBe(false);
  });

  test('should handle row command visibility correctly', () => {
    const visibleCommand = new MockCommand1();
    visibleCommand.isVisible = true;

    const hiddenCommand = new MockCommand2();
    hiddenCommand.isVisible = false;

    const rowCommand = createRowCommand([visibleCommand, hiddenCommand]);

    expect(rowCommand.isVisible).toBe(true);
  });
});
