/*!
 * Copyright 2024 Cognite AS
 */

import { type InstanceStylingGroup } from '../../../components/Reveal3DResources/types';

export class InstanceStylingController {
  private readonly _stylingMap = new Map<symbol, InstanceStylingGroup>();

  setStylingGroup(symbol: symbol, group: InstanceStylingGroup | undefined): void {
    if (group === undefined) {
      this._stylingMap.delete(symbol);
      return;
    }

    this._stylingMap.set(symbol, group);
  }

  getStylingGroups(): Iterable<InstanceStylingGroup> {
    return this._stylingMap.values();
  }
}
