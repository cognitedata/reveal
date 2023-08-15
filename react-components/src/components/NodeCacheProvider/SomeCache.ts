/*!
 * Copyright 2023 Cognite AS
 */

/*!
 * Copyright 2023 Cognite AS
 */
import { type FdmId } from './NodeCache';
import { type SpaceRevisionCache } from './SpaceRevisionCache';

type RevisionId = number;
type Space = string;
type ScopeId = `${Space}-${RevisionId}`;

export type NodeIndex = {
  modelId: number;
  revisionId: number;
  treeIndex: number;
};

class SomeCache {
  private readonly _spaceRevisionCaches = new Map<ScopeId, SpaceRevisionCache>();

  public async getAllFdmMappings(
    space: string,
    revisionId: number
  ): Promise<Array<FdmId & NodeIndex>> {}

  public async getFdmMappingsFor3DNode(
    space: string,
    modelId: number,
    revisionId: number,
    treeIndex: number
  ): Promise<FdmId[]> {}

  public async getTreeIndexesForFdmNode(
    space: string,
    externalId: string
  ): Promise<{ modelId: number; revisionId: number; treeIndex: number }> {}
}
