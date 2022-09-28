/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { SerializedNodeCollection } from './SerializedNodeCollection';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';

import range from 'lodash/range';
import cloneDeep from 'lodash/cloneDeep';
import { CdfNodeCollectionBase } from './CdfNodeCollectionBase';

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
export class PropertyFilterNodeCollection extends CdfNodeCollectionBase {
  public static readonly classToken = 'PropertyFilterNodeCollection';

  private readonly _client: CogniteClient;

  private readonly _model: CdfModelNodeCollectionDataProvider;
  private readonly _options: Required<PropertyFilterNodeCollectionOptions>;
  private readonly _filter: {
    [category: string]: {
      [key: string]: string;
    };
  } = {};

  constructor(
    client: CogniteClient,
    model: CdfModelNodeCollectionDataProvider,
    options: PropertyFilterNodeCollectionOptions = {}
  ) {
    super(PropertyFilterNodeCollection.classToken, model);
    this._client = client;
    this._model = model;
    this._options = { requestPartitions: 1, ...options };
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
  executeFilter(filter: {
    [category: string]: {
      [key: string]: string;
    };
  }): Promise<void> {
    const { modelId, revisionId } = this._model;
    const { requestPartitions } = this._options;
    const responses = range(1, requestPartitions + 1).map(p => {
      const response = this._client.revisions3D.list3DNodes(modelId, revisionId, {
        properties: filter,
        limit: 1000,
        sortByNodeId: true,
        partition: `${p}/${requestPartitions}`
      });
      return response;
    });
    return this.updateCollectionFromResults(responses);
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: cloneDeep(this._filter),
      options: { ...this._options }
    };
  }
}
