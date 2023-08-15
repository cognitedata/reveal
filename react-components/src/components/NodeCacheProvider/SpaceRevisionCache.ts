/*!
 * Copyright 2023 Cognite AS
 */

import { type FdmId } from './NodeCache';
import { type NodeIndex } from './SomeCache';

export class SpaceRevisionCache {
  private readonly _space: string;
  private readonly _revisionId: number;

  private readonly _treeIndexToFdm = new Map<number, FdmId[]>();

  constructor(space: string, revisionId: number) {
    this._space = space;
    this._revisionId = revisionId;
  }

  public async getAllFdmMappings(): Promise<Array<FdmId & NodeIndex>> {}
}
