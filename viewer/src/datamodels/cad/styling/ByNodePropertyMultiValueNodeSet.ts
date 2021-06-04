/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient, HttpRequestOptions, ListResponse, Node3D } from '@cognite/sdk';

import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';
import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';
import { NodeSet } from './NodeSet';

import range from 'lodash/range';
import { ByNodePropertyNodeSetOptions } from './ByNodePropertyNodeSet';

export class ByNodePropertyMultiValueNodeSet extends NodeSet {
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

  async executeFilter(propertyCategory: string, propertyKey: string, propertyValues: string[]): Promise<void> {
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

    const outputsUrl = this.buildUrl();
    const batches = splitQueryToBatches(propertyValues);
    const requests = Array.from(batches).flatMap(batch => {
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

  getIndexSet(): IndexSet {
    return this._indexSet;
  }

  private buildUrl(): string {
    return `${this._client.getBaseUrl()}/api/playground/projects/${this._client.project}/3d/models/${
      this._modelId
    }/revisions/${this._revisionId}/nodes/list`;
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
