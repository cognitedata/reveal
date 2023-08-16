/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult } from '@tanstack/react-query';
import { useGetAllExternalIds } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type FdmEdgeWithNode } from '../components/NodeCacheProvider/types';

export type ModelRevisionKey = `${number}-${number}`;
export type ModelRevisionToEdgeMap = Map<ModelRevisionKey, FdmEdgeWithNode[]>;

export const useMappedEquipmentByRevisionList = (
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  enabled = true
): UseQueryResult<ModelRevisionToEdgeMap> => {
  return useGetAllExternalIds(modelRevisionIds, enabled);
};
