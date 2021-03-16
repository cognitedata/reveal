/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';
import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { AsyncNodeSetBase } from './AsyncNodeSetBase';
import { range } from 'lodash';

export type ByNodePropertyNodeSetOptions = {
  /**
   * How many partitions to split the request into. More partitions can yield better performance
   * for queries with very large result set (in order of magnitude 100.000 plus).
   * Defaults to 1.
   */
  requestPartitions?: number;
};
export class ByNodePropertyNodeSet extends AsyncNodeSetBase {
  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private readonly _modelId: number;
  private readonly _revisionId: number;
  private readonly _options: Required<ByNodePropertyNodeSetOptions>;

  constructor(client: CogniteClient, model: Cognite3DModel, options: ByNodePropertyNodeSetOptions = {}) {
    super();
    this._client = client;
    this._modelId = model.modelId;
    this._revisionId = model.revisionId;
    this._options = { requestPartitions: 1, ...options };
  }

  async executeFilter(query: {
    [category: string]: {
      [key: string]: string;
    };
  }): Promise<void> {
    const queryId = this.startQuery();
    const indexSet = new IndexSet();
    const { requestPartitions } = this._options;

    this._indexSet = indexSet;
    this.notifyChanged();

    const requests = range(1, requestPartitions + 1).map(async p => {
      const request = await this._client.revisions3D.list3DNodes(this._modelId, this._revisionId, {
        properties: query,
        limit: 1000,
        sortByNodeId: true,
        partition: `${p}/${requestPartitions}`
      });
      await this.pageResults(queryId, request, node => {
        if (!indexSet.contains(node.treeIndex)) {
          indexSet.addRange(new NumericRange(node.treeIndex, node.subtreeSize));
        }
      });
    });
    await Promise.all(requests);

    if (this.completeQuery(queryId)) {
      this.notifyChanged();
    }
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }
}
