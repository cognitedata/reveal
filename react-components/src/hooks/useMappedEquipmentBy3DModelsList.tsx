/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import {
  type InModel3dEdgeProperties,
} from '../utilities/globalDataModels';
import { type FdmSDK, type EdgeItem } from '../utilities/FdmSDK';
import { useGetAllExternalIds } from '../components/NodeCacheProvider/NodeCacheProvider';
import { FdmEdgeWithNode } from '../components/NodeCacheProvider/RevisionNodeCache';

export type ModelRevisionId = `${number}-${number}`;
export type ModelRevisionToEdgeMap = Map<ModelRevisionId, Array<FdmEdgeWithNode>>;

export const useMappedEquipmentByRevisionList = (
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  enabled = true
): UseQueryResult<ModelRevisionToEdgeMap> => {
  return useGetAllExternalIds(modelRevisionIds, enabled);
};
