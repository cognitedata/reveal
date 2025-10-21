import type { CogniteClient, List3DNodesQuery, Node3D } from '@cognite/sdk';
import { type IListNodesSdk } from './i-list-nodes-sdk';

export class ListNodesSdk implements IListNodesSdk {
  private readonly _sdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public async list3DNodes(
    modelId: number,
    revisionId: number,
    query: List3DNodesQuery
  ): Promise<{ items: Node3D[]; nextCursor?: string }> {
    return await this._sdk.revisions3D.list3DNodes(modelId, revisionId, query);
  }

  public async list3DNodeAncestors(
    modelId: number,
    revisionId: number,
    nodeId: number
  ): Promise<{ items: Node3D[] }> {
    return await this._sdk.revisions3D.list3DNodeAncestors(modelId, revisionId, nodeId);
  }
}
