/*!
 * Copyright 2025 Cognite AS
 */

import { useContext } from 'react';
import {
  Reveal3DResourcesContext,
  type Reveal3DResourcesDependencies
} from './Reveal3DResources.context';

export function use3DResourcesViewModel(): Reveal3DResourcesDependencies {
  const {
    useAssetMappedNodesForRevisions,
    useCalculateCadStyling,
    useCalculateImage360Styling,
    useCalculatePointCloudStyling,
    useCallCallbackOnFinishedLoading,
    useGenerateAssetMappingCachePerItemFromModelCache,
    useGenerateNode3DCache,
    useReveal,
    useRemoveNonReferencedModels,
    useReveal3DResourcesStylingLoadingSetter,
    useSetExpectedLoadCount,
    useTypedModels,
    CadModelContainer,
    Image360CollectionContainer,
    PointCloudContainer
  } = useContext(Reveal3DResourcesContext);

  return {
    useAssetMappedNodesForRevisions,
    useCalculateCadStyling,
    useCalculateImage360Styling,
    useCalculatePointCloudStyling,
    useCallCallbackOnFinishedLoading,
    useGenerateAssetMappingCachePerItemFromModelCache,
    useGenerateNode3DCache,
    useReveal,
    useRemoveNonReferencedModels,
    useReveal3DResourcesStylingLoadingSetter,
    useSetExpectedLoadCount,
    useTypedModels,
    CadModelContainer,
    Image360CollectionContainer,
    PointCloudContainer
  };
}
