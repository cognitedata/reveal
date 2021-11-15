/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';
import { PropertyFilterNodeCollectionOptions } from './PropertyFilterNodeCollection';

import { IndexSet, NumericRange, toThreeBox3 } from '@reveal/utilities';
import { AreaCollection, EmptyAreaCollection, NodeCollectionBase, SerializedNodeCollection } from '@reveal/cad-styling';

import { CogniteClient, HttpRequestOptions, ListResponse, Node3D } from '@cognite/sdk';

import range from 'lodash/range';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Node collection that filters nodes based on a node property from a list of values, similarly to how
 * `SELECT ... IN (...)` works. This is useful when looking up nodes based on a list of identifiers,
 * nodes within a set of areas or systems. The node set is optimized for matching with properties with
 * a large number of values (i.e. thousands).
 */
export class SinglePropertyFilterNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'SinglePropertyNodeCollection';

  private readonly _client: CogniteClient;
  private readonly _model: Cognite3DModel;

  private _indexSet = new IndexSet();
  private _areas: AreaCollection = EmptyAreaCollection.instance();

  private readonly _options: Required<PropertyFilterNodeCollectionOptions>;
  private _fetchResultHelper: PopulateIndexSetFromPagedResponseHelper<Node3D> | undefined;
  private readonly _filter = {
    propertyCategory: '',
    propertyKey: '',
    propertyValues: new Array<string>()
  };
  /**
   * Construct a new node set.
   * @param client   {@link CogniteClient} authenticated to the project the model is loaded from.
   * @param model    CAD model.
   * @param options
   */
  constructor(client: CogniteClient, model: Cognite3DModel, options: PropertyFilterNodeCollectionOptions = {}) {
    super(SinglePropertyFilterNodeCollection.classToken);
    this._client = client;
    this._model = model;
    this._options = { requestPartitions: 1, ...options };
  }

  get isLoading(): boolean {
    return this._fetchResultHelper !== undefined && this._fetchResultHelper.isLoading;
  }

  /**
   * Execute filter asynchronously, replacing any existing filter active. When {@link propertyValues}
   * contains more than 1000 elements, the operation will be split into multiple batches that
   * are executed in parallel. Note that when providing a {@link PropertyFilterNodeCollectionOptions.requestPartitions}
   * during construction of the node set, the total number of batches will be requestPartitions*numberOfBatches.
   *
   * @param propertyCategory Node property category, e.g. `'PDMS'`.
   * @param propertyKey Node property key, e.g. `':FU'`.
   * @param propertyValues Lookup values, e.g. `["AR100APG539","AP500INF534","AP400INF553", ...]`
   */
  async executeFilter(propertyCategory: string, propertyKey: string, propertyValues: string[]): Promise<void> {
    const { requestPartitions } = this._options;

    if (this._fetchResultHelper !== undefined) {
      // Interrupt any ongoing operation to avoid fetching results unnecessary
      this._fetchResultHelper.interrupt();
    }
    const fetchResultHelper = new PopulateIndexSetFromPagedResponseHelper<Node3D>(
      nodes => nodes.map(node => new NumericRange(node.treeIndex, node.subtreeSize)),
      async nodes => {
        return nodes.map(node => {
          const box = new THREE.Box3();
          if (node.boundingBox !== undefined) {
            toThreeBox3(node.boundingBox, box);
            this._model.mapBoxFromCdfToModelCoordinates(box, box);
          }
          return box;
        });
      },
      () => this.notifyChanged()
    );
    this._fetchResultHelper = fetchResultHelper;
    this._indexSet = fetchResultHelper.indexSet;
    this._areas = fetchResultHelper.areas;
    const outputsUrl = this.buildUrl();
    const batches = Array.from(splitQueryToBatches(propertyValues));

    const requests = batches.flatMap(batch => {
      const filter = { properties: { [`${propertyCategory}`]: { [`${propertyKey}`]: batch } } };
      const batchRequests = range(1, requestPartitions + 1).map(async p => {
        const response = postAsListResponse<Node3D[]>(this._client, outputsUrl, {
          data: {
            filter,
            limit: 1000,
            partition: `${p}/${requestPartitions}`
          }
        });

        return fetchResultHelper.pageResults(response);
      });
      return batchRequests;
    });

    this.notifyChanged();
    await Promise.all(requests);
  }

  /**
   * Clears the node set and interrupts any ongoing operations.
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

  private buildUrl(): string {
    return `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/3d/models/${
      this._model.modelId
    }/revisions/${this._model.revisionId}/nodes/list`;
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: cloneDeep(this._filter),
      options: { ...this._options }
    };
  }
}

function* splitQueryToBatches(propertyValues: string[]): Generator<string[]> {
  const batchSize = 1000;
  for (let i = 0; i < propertyValues.length; i += batchSize) {
    const batch = propertyValues.slice(i, Math.min(propertyValues.length, i + batchSize));
    yield batch;
  }
}

type RawListResponse<T> = {
  items: T;
  nextCursor?: string;
};

/**
 * Helper class for implementing paging support for {@link CogniteClient.post}.
 */
class EmulatedListResponse<T> {
  constructor(client: CogniteClient, url: string, options: HttpRequestOptions, rawResponse: RawListResponse<T>) {
    this.items = rawResponse.items;
    this.nextCursor = rawResponse.nextCursor;
    if (this.nextCursor !== undefined) {
      this.next = async () => {
        const nextOptions = { ...options, data: { ...options.data, cursor: this.nextCursor } };
        const response = await postAsListResponseRaw<T>(client, url, nextOptions);
        return new EmulatedListResponse<T>(client, url, options, response);
      };
    }
  }

  readonly items: T;
  readonly nextCursor?: string;
  readonly next?: () => Promise<ListResponse<T>>;
}

/**
 * Fetch query using {@see CogniteClient.post} and add paging support.
 * @param client
 * @param url
 * @param options
 * @returns
 */
async function postAsListResponse<T>(
  client: CogniteClient,
  url: string,
  options: HttpRequestOptions
): Promise<ListResponse<T>> {
  const rawResponse = await postAsListResponseRaw<T>(client, url, options);
  return new EmulatedListResponse<T>(client, url, options, rawResponse);
}

async function postAsListResponseRaw<T>(
  client: CogniteClient,
  url: string,
  options: HttpRequestOptions
): Promise<RawListResponse<T>> {
  const response = await client.post<RawListResponse<T>>(url, options);
  if (response.status === 200) {
    return response.data;
  }
  throw new Error(`Unexpected status from server while POST ${url}: ${response.status} (body: ${response.data})`);
}
