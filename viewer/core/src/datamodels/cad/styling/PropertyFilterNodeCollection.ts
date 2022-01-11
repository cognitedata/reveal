/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient, Node3D } from '@cognite/sdk';

import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';

import { NodeCollectionBase, SerializedNodeCollection } from '@reveal/cad-styling';
import { IndexSet, NumericRange } from '@reveal/utilities';

import range from 'lodash/range';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Options for {@link PropertyFilterNodeCollection}.
 */
export type PropertyFilterNodeCollectionOptions = {
  /**
   * How many partitions to split the request into. More partitions can yield better performance
   * for queries with very large result set (in order of magnitude 100.000 plus).
   * Defaults to 1.
   */
  requestPartitions?: number;
};

/**
 * Represents a set of nodes that has matching node properties to a provided filter. Note that
 * a node is considered to match if it or a {@link NodeCollectionBase} ancestors match the filter.
 */
export class PropertyFilterNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'PropertyFilterNodeCollection';

  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private readonly _modelId: number;
  private readonly _revisionId: number;
  private readonly _options: Required<PropertyFilterNodeCollectionOptions>;
  private _fetchResultHelper: PopulateIndexSetFromPagedResponseHelper<Node3D> | undefined;
  private _filter: {
    [category: string]: {
      [key: string]: string;
    };
  } = {};

  constructor(client: CogniteClient, model: Cognite3DModel, options: PropertyFilterNodeCollectionOptions = {}) {
    super(PropertyFilterNodeCollection.classToken);
    this._client = client;
    this._modelId = model.modelId;
    this._revisionId = model.revisionId;
    this._options = { requestPartitions: 1, ...options };
  }

  get isLoading(): boolean {
    return this._fetchResultHelper !== undefined && this._fetchResultHelper.isLoading;
  }

  /**
   * Populates the node collection with nodes matching the provided filter. This will replace
   * the current nodes held by the filter.
   * @param filter A filter for matching node properties.
   * @example
   * ```
   * set.executeFilter({ 'PDMS': { 'Module': 'AQ550' }});
   * ```
   */
  async executeFilter(filter: {
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
      node => new NumericRange(node.treeIndex, node.subtreeSize),
      () => this.notifyChanged()
    );
    this._fetchResultHelper = fetchResultHelper;

    this._indexSet = indexSet;

    const requests = range(1, requestPartitions + 1).map(async p => {
      const response = this._client.revisions3D.list3DNodes(this._modelId, this._revisionId, {
        properties: filter,
        limit: 1000,
        sortByNodeId: true,
        partition: `${p}/${requestPartitions}`
      });
      return fetchResultHelper.pageResults(indexSet, response);
    });

    this._filter = filter;

    this.notifyChanged();
    await Promise.all(requests);
  }

  /**
   * Clears the node collection and interrupts any ongoing operations.
   */
  clear(): void {
    if (this._fetchResultHelper !== undefined) {
      this._fetchResultHelper.interrupt();
    }
    this._indexSet.clear();
    this.notifyChanged();
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: cloneDeep(this._filter),
      options: { ...this._options }
    };
  }
}
