/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult } from '@tanstack/react-query';
import { type ThreeDModelMappings } from './types';
import { type DmsUniqueIdentifier } from '../utilities/FdmSDK';
import { type TypedReveal3DModel } from '../components/Reveal3DResources/types';
import { useSpecificMappings } from '../components/NodeCacheProvider/NodeCacheProvider';

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (
  fdmAssetExternalIds: DmsUniqueIdentifier[],
  models: TypedReveal3DModel[]
): UseQueryResult<ThreeDModelMappings[]> => {
  return useSpecificMappings(fdmAssetExternalIds, models);
};
