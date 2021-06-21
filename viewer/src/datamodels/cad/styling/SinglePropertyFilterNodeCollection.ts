/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient, HttpRequestOptions, ListResponse, Node3D } from '@cognite/sdk';

import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';
import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';

import range from 'lodash/range';
import { PropertyFilterNodeCollectionOptions } from './PropertyFilterNodeCollection';
import { NodeCollectionBase } from './NodeCollectionBase';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Node collection that filters nodes based on a node property from a list of values, similarly to how
 * `SELECT ... IN (...)` works. This is useful when looking up nodes based on a list of identifiers,
 * nodes within a set of areas or systems. The node set is optimized for matching with properties with
 * a large number of values (i.e. thousands).
 *
 * @experimental This is an experimental feature that might be changed or removed, and changes
 * in minor releases might cause breaking changes.
 */
export class SinglePropertyFilterNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'SinglePropertyNodeCollection';

  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private readonly _modelId: number;
  private readonly _revisionId: number;
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
    this._modelId = model.modelId;
    this._revisionId = model.revisionId;
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
    const outputsUrl = this.buildUrl();
    const batches = Array.from(splitQueryToBatches(propertyValues));
    const requests = batches.flatMap(batch => {
      const filter = { [`${propertyCategory}`]: { [`${propertyKey}`]: batch } };
      const batchRequests = range(1, requestPartitions + 1).map(async p => {
        const response = postAsListResponse<Node3D[]>(this._client, outputsUrl, {
          params: {
            partition: `${p}/${requestPartitions}`,
            limit: 1000
          },
          data: {
            filter
          }
        });

        return fetchResultHelper.pageResults(indexSet, response);
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

  private buildUrl(): string {
    return `${this._client.getBaseUrl()}/api/playground/projects/${this._client.project}/3d/v2/models/${
      this._modelId
    }/revisions/${this._revisionId}/nodes/list`;
  }

  /** @internal */
  serialize() {
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
        const nextOptions = { ...options, cursor: this.nextCursor };
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
