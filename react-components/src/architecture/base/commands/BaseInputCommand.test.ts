import { describe, expect, test, vi } from 'vitest';
import { BaseInputCommand } from './BaseInputCommand';
import { TestInputCommand } from '#test-utils/architecture/commands/TestInputCommand';
import { type CommandUpdateDelegate } from './BaseCommand';

describe(BaseInputCommand.name, () => {
  test('getters/setters work as expected', () => {
    const mockContent = 'mock-content';
    const mockOnCancel = vi.fn();
    const mockEventListener = vi.fn<CommandUpdateDelegate>();

    const command = new TestInputCommand();

    command.addEventListener(mockEventListener);

    expect(command.content).toBe('');
    expect(command.onCancel).toBe(undefined);

    command.content = mockContent;
    expect(mockEventListener).toHaveBeenCalled();
    expect(command.content).toBe(mockContent);

    command.onCancel = mockOnCancel;
    expect(command.onCancel).toBe(mockOnCancel);
  });

  test('post button should be enabled only when content is non-empty', () => {
    const command = new TestInputCommand();

    expect(command.isPostButtonEnabled).toBeFalsy();

    command.content = 'some-content';

    expect(command.isPostButtonEnabled).toBeTruthy();

    command.content = '';

    expect(command.isPostButtonEnabled).toBeFalsy();
  });
});
