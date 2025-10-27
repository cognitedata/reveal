import { describe, expect, test } from 'vitest';
import { GroupCommand, type GroupCommandConfiguration } from './GroupCommand';
import { MockCommand } from '#test-utils/architecture/mock-commands/MockCommand';

describe(GroupCommand.name, () => {
  const createMockCommands = ({ count }: { count: number }): MockCommand[] => {
    return Array.from({ length: count }, () => new MockCommand());
  };
  const createGroupCommand = (config: GroupCommandConfiguration): GroupCommand => {
    return new GroupCommand(config);
  };

  test('should create GroupCommand with valid configuration', () => {
    const commands = createMockCommands({ count: 3 });
    const config: GroupCommandConfiguration = {
      title: { untranslated: 'Test Group' },
      commands
    };

    const groupCommand = createGroupCommand(config);

    expect(groupCommand.title).toEqual({ untranslated: 'Test Group' });
    expect(groupCommand.commands).toEqual(commands);
    expect(groupCommand.hasCommands).toBe(true);
  });

  test('should create GroupCommand with empty commands array', () => {
    const config: GroupCommandConfiguration = {
      title: { untranslated: 'Empty Group' },
      commands: []
    };

    const groupCommand = createGroupCommand(config);

    expect(groupCommand.title).toEqual({ untranslated: 'Empty Group' });
    expect(groupCommand.commands).toEqual([]);
    expect(groupCommand.hasCommands).toBe(false);
  });

  test('should return correct title', () => {
    const commands = createMockCommands({ count: 2 });
    const groupCommand = createGroupCommand({
      title: { untranslated: 'My Group Title' },
      commands
    });

    expect(groupCommand.title).toEqual({ untranslated: 'My Group Title' });
  });

  test('should return correct commands array', () => {
    const commands = createMockCommands({ count: 3 });
    const groupCommand = createGroupCommand({
      title: { untranslated: 'Test' },
      commands
    });

    expect(groupCommand.commands).toEqual(commands);
    expect(groupCommand.commands).toHaveLength(3);
  });

  test('should return hasCommands correctly', () => {
    const commandsWithItems = createMockCommands({ count: 2 });
    const groupWithCommands = createGroupCommand({
      title: { untranslated: 'With Commands' },
      commands: commandsWithItems
    });

    const groupWithoutCommands = createGroupCommand({
      title: { untranslated: 'Without Commands' },
      commands: []
    });

    expect(groupWithCommands.hasCommands).toBe(true);
    expect(groupWithoutCommands.hasCommands).toBe(false);
  });

  test('should be visible when at least one command is visible', () => {
    const visibleCommand = new MockCommand();
    visibleCommand.isVisible = true;

    const hiddenCommand = new MockCommand();
    hiddenCommand.isVisible = false;

    const groupCommand = createGroupCommand({
      title: { untranslated: 'Mixed Visibility' },
      commands: [visibleCommand, hiddenCommand]
    });

    expect(groupCommand.isVisible).toBe(true);
  });

  test('should be hidden when all commands are hidden', () => {
    const hiddenCommand1 = new MockCommand();
    hiddenCommand1.isVisible = false;

    const hiddenCommand2 = new MockCommand();
    hiddenCommand2.isVisible = false;

    const groupCommand = createGroupCommand({
      title: { untranslated: 'All Hidden' },
      commands: [hiddenCommand1, hiddenCommand2]
    });

    expect(groupCommand.isVisible).toBe(false);
  });

  test('should be hidden when no commands exist', () => {
    const groupCommand = createGroupCommand({
      title: { untranslated: 'No Commands' },
      commands: []
    });

    expect(groupCommand.isVisible).toBe(false);
  });

  test('should be visible when all commands are visible', () => {
    const visibleCommand1 = new MockCommand();
    visibleCommand1.isVisible = true;

    const visibleCommand2 = new MockCommand();
    visibleCommand2.isVisible = true;

    const groupCommand = createGroupCommand({
      title: { untranslated: 'All Visible' },
      commands: [visibleCommand1, visibleCommand2]
    });

    expect(groupCommand.isVisible).toBe(true);
  });
});
