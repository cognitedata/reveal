import { describe, expect, test, vi } from 'vitest';
import { BaseInputCommand } from './BaseInputCommand';
import { TestInputCommand } from '#test-utils/architecture/commands/TestInputCommand';

describe(BaseInputCommand.name, () => {
  test('getters/setters work as expected', () => {
    const mockContent = 'mock-content';
    const mockOnCancel = vi.fn();
    const mockCommandUpdateListener = vi.fn();

    const command = new TestInputCommand();

    command.addEventListener(mockCommandUpdateListener);

    expect(command.content).toBe('');
    expect(command.onCancel).toBe(undefined);

    command.content = mockContent;
    expect(mockCommandUpdateListener).toHaveBeenCalled();
    expect(command.content).toBe(mockContent);

    command.onCancel = mockOnCancel;
    expect(command.onCancel).toBe(mockOnCancel);
  });

  test('post button should always be enabled', () => {
    const command = new TestInputCommand();

    expect(command.isPostButtonEnabled).toBeTruthy();

    command.content = 'some-content';

    expect(command.isPostButtonEnabled).toBeTruthy();

    command.content = '';

    expect(command.isPostButtonEnabled).toBeTruthy();
  });
});
