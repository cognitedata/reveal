/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';

import { IndexSet, NumericRange } from '@reveal/utilities';
import { NodeCollectionBase, SerializedNodeCollection } from '@reveal/cad-styling';

import { AssetMapping3D, CogniteClient } from '@cognite/sdk';

import cloneDeep from 'lodash/cloneDeep';

/**
 * Represents a set of nodes associated with an [asset in Cognite Fusion]{@link https://docs.cognite.com/api/v1/#tag/Assets}
 * linked to the 3D model using [asset mappings]{@link https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping}. A node
 * is considered to be part of an asset if it has a direct asset mapping or if one of its ancestors has an asset mapping
 * to the asset.
 */
export class AssetNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'AssetNodeCollection';

  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private readonly _model: Cognite3DModel;
  private _fetchResultHelper: PopulateIndexSetFromPagedResponseHelper<AssetMapping3D> | undefined;
  private _filter: { assetId?: number; boundingBox?: THREE.Box3 } | undefined;

  constructor(client: CogniteClient, model: Cognite3DModel) {
    super(AssetNodeCollection.classToken);
    this._client = client;
    this._model = model;
    this._fetchResultHelper = undefined;
  }

  get isLoading(): boolean {
    return this._fetchResultHelper !== undefined && this._fetchResultHelper.isLoading;
  }

  /**
   * Updates the node collection to hold nodes associated with the asset given, or
   * assets within the bounding box or all assets associated with the 3D model.
   * @param filter
   * @param filter.assetId      ID of a single [asset]{@link https://docs.cognite.com/dev/concepts/resource_types/assets.html} (optional)
   * @param filter.boundingBox  When provided, only assets within the provided bounds will be included in the filter.
   */
  async executeFilter(filter: { assetId?: number; boundingBox?: THREE.Box3 }): Promise<void> {
    const model = this._model;

    if (this._fetchResultHelper !== undefined) {
      // Interrupt any ongoing operation to avoid fetching results unnecessary
      this._fetchResultHelper.interrupt();
    }
    const fetchResultHelper = new PopulateIndexSetFromPagedResponseHelper<AssetMapping3D>(
      assetMapping => new NumericRange(assetMapping.treeIndex, assetMapping.subtreeSize),
      () => this.notifyChanged()
    );
    this._fetchResultHelper = fetchResultHelper;

    function mapBoundingBox(box?: THREE.Box3) {
      if (box === undefined) {
        return undefined;
      }

      const result = new THREE.Box3().copy(box);
      model.mapBoxFromModelToCdfCoordinates(result, result);
      return { min: [result.min.x, result.min.y, result.min.z], max: [result.max.x, result.max.y, result.max.z] };
    }

    const filterQuery = {
      assetId: filter.assetId,
      intersectsBoundingBox: mapBoundingBox(filter.boundingBox),
      limit: 1000
    };

    const indexSet = new IndexSet();
    this._indexSet = indexSet;

    this._filter = filter;

    const request = this._client.assetMappings3D.list(model.modelId, model.revisionId, filterQuery);
    const completed = await fetchResultHelper.pageResults(indexSet, request);

    if (completed) {
      // Completed without being interrupted
      this._fetchResultHelper = undefined;
    }
  }

  clear(): void {
    if (this._fetchResultHelper !== undefined) {
      this._fetchResultHelper.interrupt();
    }
    this._indexSet.clear();
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: cloneDeep(this._filter)
    };
  }
}
