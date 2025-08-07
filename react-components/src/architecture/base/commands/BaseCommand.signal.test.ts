import { describe, expect, test, vi } from 'vitest';
import { BaseCommand, type CommandUpdateDelegate } from './BaseCommand';
import { signal } from '@cognite/signals';

describe(BaseCommand.name, () => {
  test('should call event listeners when signal change', async () => {
    const command = new DisposableCommand();

    const mockEventListener = vi.fn<CommandUpdateDelegate>();
    command.addEventListener(mockEventListener);
    expect(mockEventListener).toHaveBeenCalledTimes(0);

    command.mySignal1(42);
    expect(mockEventListener).toHaveBeenCalledTimes(1);

    command.mySignal2(42);
    expect(mockEventListener).toHaveBeenCalledTimes(2);
  });

  test('should not call event listeners when signal change after dispose', async () => {
    const command = new DisposableCommand();

    const mockEventListener = vi.fn<CommandUpdateDelegate>();
    command.addEventListener(mockEventListener);

    command.dispose();
    command.mySignal2(42);
    command.mySignal1(42);
    expect(mockEventListener).toHaveBeenCalledTimes(0);
  });

  test('should dispose', () => {
    const disposeFunc = vi.fn();
    const command = new DisposableCommand(disposeFunc);
    expect(command.disposableCount).toBe(3);

    // Now dispose it
    command.dispose();
    expect(command.disposableCount).toBe(0);
    expect(disposeFunc).toBeCalledTimes(1);

    // Now dispose it again
    command.dispose();
    expect(command.disposableCount).toBe(0);
    expect(disposeFunc).toBeCalledTimes(1);
  });
});

class DisposableCommand extends BaseCommand {
  public readonly mySignal1 = signal(0);
  public readonly mySignal2 = signal(0);

  public constructor(disposable?: () => void) {
    super();
    if (disposable !== undefined) {
      this.addDisposable(disposable);
    }
    this.addEffect(() => {
      this.mySignal1();
      this.update();
    });
    this.listenTo(this.mySignal2);
  }
}
