import { type TranslationInput } from '../utilities/TranslateInput';

import { describe, test, expect, vi } from 'vitest';
import { DomainObject } from './DomainObject';
import { signal } from '@cognite/signals';
import { Changes } from '../domainObjectsHelpers/Changes';
import { EventChangeTester } from '../../../../tests/tests-utilities/architecture/EventChangeTester';

describe(DomainObject.name, () => {
  test('should call event listeners when signal change', async () => {
    const domainObject = new DisposableDomainObject();
    const tester = new EventChangeTester(domainObject, Changes.geometry);

    tester.toHaveNotBeenCalled();
    domainObject.mySignal(42);
    tester.toHaveBeenCalledOnce();
  });

  test('should not call event listeners when signal change after dispose', async () => {
    const domainObject = new DisposableDomainObject();
    const tester = new EventChangeTester(domainObject, Changes.geometry);
    tester.toHaveNotBeenCalled();
    domainObject.dispose();
    domainObject.mySignal(42);
    tester.toHaveNotBeenCalled();
  });

  test('should dispose', () => {
    const disposeFunc = vi.fn();
    const domainObject = new DisposableDomainObject(disposeFunc);
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

class DisposableDomainObject extends DomainObject {
  public readonly mySignal = signal(0);

  public override get typeName(): TranslationInput {
    return { untranslated: 'Disposable' };
  }

  public constructor(disposable?: () => void) {
    super();
    if (disposable !== undefined) {
      this.addDisposable(disposable);
    }
    this.addEffect(() => {
      this.mySignal();
      this.notify(Changes.geometry);
    });
  }
}
