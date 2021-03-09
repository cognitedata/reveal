/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';
import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { AsyncNodeSetBase } from './AsyncNodeSetBase';

export class ByNodePropertyNodeSet extends AsyncNodeSetBase {
  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private readonly _modelId: number;
  private readonly _revisionId: number;

  constructor(client: CogniteClient, model: Cognite3DModel) {
    super();
    this._client = client;
    this._modelId = model.modelId;
    this._revisionId = model.revisionId;
  }

  async executeFilter(query: {
    [category: string]: {
      [key: string]: string;
    };
  }): Promise<void> {
    const queryId = this.startQuery();
    const indexSet = new IndexSet();

    const request = await this._client.revisions3D.list3DNodes(this._modelId, this._revisionId, {
      properties: query,
      limit: 1000
    });

    this._indexSet = indexSet;
    this.notifyChanged();

    await this.pageResults(queryId, request, node => {
      if (!indexSet.contains(node.treeIndex)) {
        indexSet.addRange(new NumericRange(node.treeIndex, node.subtreeSize));
      }
    });
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }
}
