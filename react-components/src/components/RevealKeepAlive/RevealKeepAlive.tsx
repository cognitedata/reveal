/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactNode, type ReactElement, useRef, useEffect } from 'react';
import { RevealKeepAliveContext } from './RevealKeepAliveContext';
import { type FdmNodeCache } from '../CacheProvider/FdmNodeCache';
import { type AssetMappingAndNode3DCache } from '../CacheProvider/AssetMappingAndNode3DCache';
import { type PointCloudAnnotationCache } from '../CacheProvider/PointCloudAnnotationCache';
import { type Image360AnnotationCache } from '../CacheProvider/Image360AnnotationCache';
import { type SceneIdentifiers } from '../SceneContainer/sceneTypes';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';

export function RevealKeepAlive({ children }: { children?: ReactNode }): ReactElement {
  const renderTargetRef = useRef<RevealRenderTarget>();
  const isRevealContainerMountedRef = useRef<boolean>(false);
  const sceneLoadedRef = useRef<SceneIdentifiers>();
  const fdmNodeCache = useRef<FdmNodeCache>();
  const assetMappingCache = useRef<AssetMappingAndNode3DCache>();
  const pointCloudAnnotationCache = useRef<PointCloudAnnotationCache>();
  const image360AnnotationCache = useRef<Image360AnnotationCache>();

  useEffect(() => {
    return () => {
      renderTargetRef.current?.dispose();
      renderTargetRef.current = undefined;
    };
  }, []);
  return (
    <RevealKeepAliveContext.Provider
      value={{
        renderTargetRef,
        isRevealContainerMountedRef,
        sceneLoadedRef,
        fdmNodeCache,
        assetMappingCache,
        pointCloudAnnotationCache,
        image360AnnotationCache
      }}>
      {children}
    </RevealKeepAliveContext.Provider>
  );
}
