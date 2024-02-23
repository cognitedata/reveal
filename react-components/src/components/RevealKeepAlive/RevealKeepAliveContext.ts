/*!
 * Copyright 2023 Cognite AS
 */
import { type Cognite3DViewer } from '@cognite/reveal';
import { type MutableRefObject, createContext, useContext } from 'react';
import { type FdmNodeCache } from '../NodeCacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../NodeCacheProvider/AssetMappingCache';
import { type PointCloudAnnotationCache } from '../NodeCacheProvider/PointCloudAnnotationCache';
import { type Image360AnnotationCache } from '../NodeCacheProvider/Image360AnnotationCache';

export type RevealKeepAliveData = {
  viewerRef: MutableRefObject<Cognite3DViewer | undefined>;
  isRevealContainerMountedRef: MutableRefObject<boolean>;
  fdmNodeCache: MutableRefObject<FdmNodeCache | undefined>;
  assetMappingCache: MutableRefObject<AssetMappingCache | undefined>;
  pointCloudAnnotationCache: MutableRefObject<PointCloudAnnotationCache | undefined>;
  image360AnnotationCache: MutableRefObject<Image360AnnotationCache | undefined>;
};

export const RevealKeepAliveContext = createContext<RevealKeepAliveData | undefined>(undefined);

export const useRevealKeepAlive = (): RevealKeepAliveData | undefined => {
  return useContext(RevealKeepAliveContext);
};
