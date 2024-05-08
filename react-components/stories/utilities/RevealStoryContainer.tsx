/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useMemo } from 'react';
import { RevealKeepAliveContext } from '../../src/components/RevealKeepAlive/RevealKeepAliveContext';
import { RevealCanvas } from '../../src/components/RevealCanvas/RevealCanvas';
import { type FdmNodeCache } from '../../src/components/CacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../../src/components/CacheProvider/AssetMappingCache';
import { type CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '@cognite/reveal';
import { createSdkByUrlToken } from './createSdkByUrlToken';
import { type PointCloudAnnotationCache } from '../../src/components/CacheProvider/PointCloudAnnotationCache';
import {
  RevealContext,
  type RevealContextProps
} from '../../src/components/RevealContext/RevealContext';
import { type Image360AnnotationCache } from '../../src/components/CacheProvider/Image360AnnotationCache';
import { type SceneIdentifiers } from '../../src/components/SceneContainer/sceneTypes';
import { RevealRenderTarget } from '../../src/architecture/RenderTarget/RevealRenderTarget';

type RevealStoryContainerProps = Omit<RevealContextProps, 'sdk'> & {
  sdk?: CogniteClient;
  viewer?: Cognite3DViewer;
};

export const RevealStoryContext = ({
  viewer,
  sdk,
  children,
  ...rest
}: RevealStoryContainerProps): ReactElement => {
  const sdkInstance = useMemo(() => {
    if (sdk !== undefined) {
      return sdk;
    }
    return createSdkByUrlToken();
  }, [sdk]);

  const isLocal = sdkInstance.project === '';

  let renderTarget: RevealRenderTarget | undefined;
  if (viewer !== undefined) {
    renderTarget = new RevealRenderTarget(viewer);
  } else if (isLocal) {
    const newViewer = new Cognite3DViewer({
      ...rest.viewerOptions,
      sdk: sdkInstance,
      // @ts-expect-error use local models
      _localModels: true,
      haveEventListeners: false
    });
    renderTarget = new RevealRenderTarget(newViewer);
    renderTarget.initialize();
  }

  const renderTargetRef = useRef<RevealRenderTarget | undefined>(renderTarget);
  const isRevealContainerMountedRef = useRef<boolean>(true);
  const sceneLoadedRef = useRef<SceneIdentifiers>();
  const fdmNodeCache = useRef<FdmNodeCache | undefined>();
  const assetMappingCache = useRef<AssetMappingCache | undefined>();
  const pointCloudAnnotationCache = useRef<PointCloudAnnotationCache | undefined>();
  const image360AnnotationCache = useRef<Image360AnnotationCache | undefined>();
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
      <RevealContext sdk={sdkInstance} {...rest}>
        {children}
      </RevealContext>
    </RevealKeepAliveContext.Provider>
  );
};

export const RevealStoryContainer = ({
  children,
  ...rest
}: RevealStoryContainerProps): ReactElement => {
  return (
    <RevealStoryContext {...rest}>
      <RevealCanvas>{children}</RevealCanvas>
    </RevealStoryContext>
  );
};
