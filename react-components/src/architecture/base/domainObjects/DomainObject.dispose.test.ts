import { type TranslationInput } from '../utilities/TranslateInput';

import { describe, test, expect, vi } from 'vitest';
import { DomainObject } from './DomainObject';
import { signal } from '@cognite/signals';

describe(DomainObject.name, () => {
  test('should dispose', () => {
    const domainObject = new DisposableDomainObject();
    expect(domainObject.disposableCount).toBe(2);

    // Now dispose it
    domainObject.dispose();
    expect(domainObject.disposableCount).toBe(0);
    expect(disposeFunc).toBeCalledTimes(1);

    // Now dispose it again
    domainObject.dispose();
    expect(disposeFunc).toBeCalledTimes(1);
  });
});

const disposeFunc = vi.fn();

class DisposableDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Disposable' };
  }

  private readonly _mySignal = signal(0);

  constructor() {
    super();
    this.addDisposable(disposeFunc);
    this.addEffect(() => {
      this._mySignal();
    });
  }
}
