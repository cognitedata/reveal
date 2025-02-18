/*!
 * Copyright 2025 Cognite AS
 */
import { createContext } from 'react';
import { useRenderTarget, useReveal } from '../RevealCanvas';
import { useRemoveNonReferencedModels } from './hooks/useRemoveNonReferencedModels';

import { useCalculatePointCloudStyling } from './hooks/useCalculatePointCloudStyling';
import { useCalculateCadStyling } from './hooks/useCalculateCadStyling';
import { useReveal3DResourcesStylingLoadingSetter } from './Reveal3DResourcesInfoContext';
import { useTypedModels } from './hooks/useTypedModels';
import {
  useAssetMappedNodesForRevisions,
  useGenerateAssetMappingCachePerItemFromModelCache,
  useGenerateNode3DCache
} from '../../hooks/cad';
import { useCallCallbackOnFinishedLoading } from './hooks/useCallCallbackOnFinishedLoading';
import { useSetExpectedLoadCount } from './hooks/useSetExpectedLoadCount';
import { useCalculateImage360Styling } from './hooks/useCalculateImage360Styling';
import { CadModelContainer } from '../CadModelContainer';
import { PointCloudContainer } from '../PointCloudContainer';
import { Image360CollectionContainer } from '../Image360CollectionContainer';

export type Reveal3DResourcesDependencies = {
  // Hooks
  useReveal: typeof useReveal;
  useRenderTarget: typeof useRenderTarget;
  useRemoveNonReferencedModels: typeof useRemoveNonReferencedModels;
  useTypedModels: typeof useTypedModels;
  useSetExpectedLoadCount: typeof useSetExpectedLoadCount;
  useCallCallbackOnFinishedLoading: typeof useCallCallbackOnFinishedLoading;
  useAssetMappedNodesForRevisions: typeof useAssetMappedNodesForRevisions;
  useGenerateAssetMappingCachePerItemFromModelCache: typeof useGenerateAssetMappingCachePerItemFromModelCache;
  useGenerateNode3DCache: typeof useGenerateNode3DCache;
  useCalculateCadStyling: typeof useCalculateCadStyling;
  useReveal3DResourcesStylingLoadingSetter: typeof useReveal3DResourcesStylingLoadingSetter;
  useCalculatePointCloudStyling: typeof useCalculatePointCloudStyling;
  useCalculateImage360Styling: typeof useCalculateImage360Styling;

  // SubComponents
  CadModelContainer: typeof CadModelContainer;
  PointCloudContainer: typeof PointCloudContainer;
  Image360CollectionContainer: typeof Image360CollectionContainer;
};

export const Reveal3DResourcesContext = createContext<Reveal3DResourcesDependencies>({
  // Hooks
  useReveal,
  useRenderTarget,
  useRemoveNonReferencedModels,
  useTypedModels,
  useSetExpectedLoadCount,
  useCallCallbackOnFinishedLoading,
  useAssetMappedNodesForRevisions,
  useGenerateAssetMappingCachePerItemFromModelCache,
  useGenerateNode3DCache,
  useCalculateCadStyling,
  useReveal3DResourcesStylingLoadingSetter,
  useCalculatePointCloudStyling,
  useCalculateImage360Styling,

  // SubComponents
  CadModelContainer,
  PointCloudContainer,
  Image360CollectionContainer
});
