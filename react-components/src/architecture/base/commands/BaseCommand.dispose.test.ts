import { describe, expect, test, vi } from 'vitest';
import { BaseCommand } from './BaseCommand';
import { signal } from '@cognite/signals';

describe(BaseCommand.name, () => {
  test('should dispose', () => {
    const command = new DisposableCommand();
    expect(command.disposableCount).toBe(2);

    // Now dispose it
    command.dispose();
    expect(command.disposableCount).toBe(0);
    expect(disposeFunc).toBeCalledTimes(1);

    // Now dispose it again
    command.dispose();
    expect(disposeFunc).toBeCalledTimes(1);
  });
});

const disposeFunc = vi.fn();

class DisposableCommand extends BaseCommand {
  private readonly _mySignal = signal(0);

  constructor() {
    super();
    this.addDisposable(disposeFunc);
    this.addEffect(() => {
      this._mySignal();
    });
  }
}
