import { expect } from 'vitest';
import { type DomainObject } from '../../../src/architecture/base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../../src/architecture/base/domainObjectsHelpers/DomainObjectChange';

export class EventChangeTester {
  private _times = 0;

  // Set isCalled to true if the change is detected
  public constructor(domainObject: DomainObject, change: symbol) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    function listener(_domainObject: DomainObject, inputChange: DomainObjectChange): void {
      if (_domainObject === domainObject && inputChange.isChanged(change)) {
        self._times++;
      }
    }
    domainObject.views.addEventListener(listener);
  }

  public toHaveBeenCalledTimes(expected: number): void {
    expect(this._times).toBe(expected);
  }

  public toHaveBeenCalledOnce(): void {
    this.toHaveBeenCalledTimes(1);
  }

  public toHaveNotBeenCalled(): void {
    this.toHaveBeenCalledTimes(0);
  }
}
