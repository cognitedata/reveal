/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { NodeSet } from './NodeSet';
import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';

export class ByNodePropertyNodeSet extends NodeSet {
  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private readonly _modelId: number;
  private readonly _revisionId: number;

  private _lastStartedQueryId = 0;
  private _lastCompletedQueryId = -1;

  constructor(client: CogniteClient, modelId: number, revisionId: number) {
    super();
    this._client = client;
    this._modelId = modelId;
    this._revisionId = revisionId;
  }

  async setQuery(query: {
    [category: string]: {
      [key: string]: string;
    };
  }) {
    const queryId = ++this._lastStartedQueryId;
    const indexSet = new IndexSet();

    let request = await this._client.revisions3D.list3DNodes(this._modelId, this._revisionId, {
      properties: query,
      limit: 1000
    });

    this._indexSet = indexSet;
    this.notifyChanged();

    while (this._indexSet === indexSet) {
      const nextRequest = request.next ? request.next() : undefined;

      request.items.forEach(node => {
        if (!indexSet.contains(node.treeIndex)) {
          indexSet.addRange(new NumericRange(node.treeIndex, node.subtreeSize));
        }
      });

      if (nextRequest) {
        this.notifyChanged();
        request = await nextRequest;
      } else {
        break;
      }
    }

    this._lastCompletedQueryId = Math.max(this._lastCompletedQueryId, queryId);
    this.notifyChanged();
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }

  get isLoading(): boolean {
    return this._lastCompletedQueryId !== this._lastStartedQueryId;
  }
}
