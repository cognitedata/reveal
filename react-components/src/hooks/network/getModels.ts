/*!
 * Copyright 2025 Cognite AS
 */

import {
  type CursorResponse,
  type Model3D,
  type HttpQueryParams,
  type CogniteClient
} from '@cognite/sdk';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';
import { type ModelWithRevisionInfo, type LatestRevisionInfoResponse } from './types';
import { mapModelsToRevisionInfo } from './utils';

export async function getModels(userSdk?: CogniteClient): Promise<ModelWithRevisionInfo[]> {
  const sdk = userSdk ?? useSDK();
  let allModels: Array<Model3D & LatestRevisionInfoResponse> = [];
  let cursor: string | undefined;
  do {
    const params: HttpQueryParams =
      cursor !== undefined
        ? { includerevisioninfo: true, limit: 1000, cursor }
        : { includerevisioninfo: true, limit: 1000 };
    const response = await sdk.get<CursorResponse<Model3D & LatestRevisionInfoResponse>>(
      `/api/v1/projects/${sdk.project}/3d/models`,
      { params }
    );

    if (response.status !== 200) {
      const error = new Error('Failed to fetch models');
      (error as any).cause = response;
      throw error;
    }

    allModels = allModels.concat(response.data.items);
    cursor = response.data.nextCursor;
  } while (cursor !== undefined);

  return mapModelsToRevisionInfo(allModels);
}
