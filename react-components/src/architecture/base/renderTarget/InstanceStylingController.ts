import { remove } from 'lodash';
import { type InstanceStylingGroup } from '../../../components/Reveal3DResources/types';

export class InstanceStylingController {
  private readonly _eventHandlers: Array<() => void> = [];

  private readonly _stylingMap = new Map<symbol, InstanceStylingGroup>();

  setStylingGroup(symbol: symbol, group: InstanceStylingGroup | undefined): void {
    if (group === undefined) {
      this._stylingMap.delete(symbol);
      this.fireChangeEvent();
      return;
    }

    this._stylingMap.set(symbol, group);
    this.fireChangeEvent();
  }

  getStylingGroups(): Iterable<InstanceStylingGroup> {
    return this._stylingMap.values();
  }

  addEventListener(eventHandler: () => void): void {
    this._eventHandlers.push(eventHandler);
  }

  removeEventListener(eventHandler: () => void): boolean {
    return remove(this._eventHandlers, eventHandler).length > 0;
  }

  private fireChangeEvent(): void {
    this._eventHandlers.forEach((f) => {
      f();
    });
  }
}
