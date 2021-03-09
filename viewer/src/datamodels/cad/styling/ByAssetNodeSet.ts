/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CogniteClient } from '@cognite/sdk';

import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { IndexSet } from '../../../utilities/IndexSet';
import { AsyncNodeSetBase } from './AsyncNodeSetBase';
import { NumericRange } from '../../../utilities/NumericRange';

export class ByAssetNodeSet extends AsyncNodeSetBase {
  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private readonly _model: Cognite3DModel;

  constructor(client: CogniteClient, model: Cognite3DModel) {
    super();
    this._client = client;
    this._model = model;
  }

  async executeFilter(filter: { assetId?: number; boundingBox?: THREE.Box3 }): Promise<void> {
    const queryId = this.startQuery();
    const model = this._model;

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

    const request = await this._client.assetMappings3D.list(model.modelId, model.revisionId, filterQuery);
    await this.pageResults(queryId, request, assetMapping => {
      if (!indexSet.contains(assetMapping.treeIndex)) {
        indexSet.addRange(new NumericRange(assetMapping.treeIndex, assetMapping.subtreeSize));
      }
    });
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }
}
