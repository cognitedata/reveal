/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient, Node3D } from '@cognite/sdk';

import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';
import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';
import { NodeSet } from './NodeSet';

import range from 'lodash/range';

export type ByNodePropertyNodeSetOptions = {
  /**
   * How many partitions to split the request into. More partitions can yield better performance
   * for queries with very large result set (in order of magnitude 100.000 plus).
   * Defaults to 1.
   */
  requestPartitions?: number;
};

export class ByNodePropertyNodeSet extends NodeSet {
  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private readonly _modelId: number;
  private readonly _revisionId: number;
  private readonly _options: Required<ByNodePropertyNodeSetOptions>;
  private _fetchResultHelper: PopulateIndexSetFromPagedResponseHelper<Node3D> | undefined;

  constructor(client: CogniteClient, model: Cognite3DModel, options: ByNodePropertyNodeSetOptions = {}) {
    super();
    this._client = client;
    this._modelId = model.modelId;
    this._revisionId = model.revisionId;
    this._options = { requestPartitions: 1, ...options };
  }

  get isLoading(): boolean {
    return this._fetchResultHelper !== undefined && this._fetchResultHelper.isLoading;
  }

  async executeFilter(query: {
    [category: string]: {
      [key: string]: string;
    };
  }): Promise<void> {
    const indexSet = new IndexSet();
    const { requestPartitions } = this._options;

    if (this._fetchResultHelper !== undefined) {
      // Interrupt any ongoing operation to avoid fetching results unnecessary
      this._fetchResultHelper.interrupt();
    }
    const fetchResultHelper = new PopulateIndexSetFromPagedResponseHelper<Node3D>(
      assetMapping => new NumericRange(assetMapping.treeIndex, assetMapping.subtreeSize),
      () => this.notifyChanged()
    );
    this._fetchResultHelper = fetchResultHelper;

    this._indexSet = indexSet;

    const requests = range(1, requestPartitions + 1).map(async p => {
      const response = this._client.revisions3D.list3DNodes(this._modelId, this._revisionId, {
        properties: query,
        limit: 1000,
        sortByNodeId: true,
        partition: `${p}/${requestPartitions}`
      });
      return fetchResultHelper.pageResults(indexSet, response);
    });

    this.notifyChanged();
    await Promise.all(requests);
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }
}
