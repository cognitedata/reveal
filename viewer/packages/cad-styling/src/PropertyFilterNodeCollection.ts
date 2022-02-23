/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CogniteClient, Node3D } from '@cognite/sdk';

import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';
import { AreaCollection } from './prioritized/AreaCollection';
import { EmptyAreaCollection } from './prioritized/EmptyAreaCollection';
import { NodeCollection } from './NodeCollection';
import { SerializedNodeCollection } from './SerializedNodeCollection';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';

import { IndexSet, NumericRange, toThreeBox3 } from '@reveal/utilities';

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
 * a node is considered to match if it or a {@link NodeCollection} ancestors match the filter.
 */
export class PropertyFilterNodeCollection extends NodeCollection {
  public static readonly classToken = 'PropertyFilterNodeCollection';

  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private _areas: AreaCollection = EmptyAreaCollection.instance();

  private readonly _model: CdfModelNodeCollectionDataProvider;
  private readonly _options: Required<PropertyFilterNodeCollectionOptions>;
  private _fetchResultHelper: PopulateIndexSetFromPagedResponseHelper<Node3D> | undefined;
  private _filter: {
    [category: string]: {
      [key: string]: string;
    };
  } = {};

  constructor(
    client: CogniteClient,
    model: CdfModelNodeCollectionDataProvider,
    options: PropertyFilterNodeCollectionOptions = {}
  ) {
    super(PropertyFilterNodeCollection.classToken);
    this._client = client;
    this._model = model;
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
    const { requestPartitions } = this._options;

    if (this._fetchResultHelper !== undefined) {
      // Interrupt any ongoing operation to avoid fetching results unnecessary
      this._fetchResultHelper.interrupt();
    }
    const fetchResultHelper = new PopulateIndexSetFromPagedResponseHelper<Node3D>(
      nodes => nodes.map(node => new NumericRange(node.treeIndex, node.subtreeSize)),
      async nodes =>
        nodes.map(node => {
          const bounds = new THREE.Box3();
          if (node.boundingBox !== undefined) {
            toThreeBox3(node.boundingBox, bounds);
            this._model.mapBoxFromCdfToModelCoordinates(bounds, bounds);
          }
          return bounds;
        }),
      () => this.notifyChanged()
    );
    this._fetchResultHelper = fetchResultHelper;

    this._indexSet = fetchResultHelper.indexSet;
    this._areas = fetchResultHelper.areas;

    const { modelId, revisionId } = this._model;
    const requests = range(1, requestPartitions + 1).map(async p => {
      const response = this._client.revisions3D.list3DNodes(modelId, revisionId, {
        properties: filter,
        limit: 1000,
        sortByNodeId: true,
        partition: `${p}/${requestPartitions}`
      });
      return fetchResultHelper.pageResults(response);
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

  getAreas(): AreaCollection {
    return this._areas;
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: cloneDeep(this._filter),
      options: { ...this._options }
    };
  }
}
