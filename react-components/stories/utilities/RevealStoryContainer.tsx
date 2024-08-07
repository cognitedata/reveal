/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useMemo } from 'react';
import { RevealKeepAliveContext } from '../../src/components/RevealKeepAlive/RevealKeepAliveContext';
import { RevealCanvas } from '../../src/components/RevealCanvas/RevealCanvas';
import { type FdmNodeCache } from '../../src/components/CacheProvider/FdmNodeCache';
import { type AssetMappingAndNode3DCache } from '../../src/components/CacheProvider/AssetMappingAndNode3DCache';
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
import { RevealRenderTarget } from '../../src/architecture/base/renderTarget/RevealRenderTarget';
import { StoryBookConfig } from '../../src/architecture/concrete/config/StoryBookConfig';

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

  const renderTarget = useMemo(() => {
    if (viewer === undefined) {
      viewer = new Cognite3DViewer({
        ...rest.viewerOptions,
        sdk: sdkInstance,
        // @ts-expect-error use local models
        _localModels: isLocal,
        hasEventListeners: false,
        useFlexibleCameraManager: true
      });
    }

    const renderTarget = new RevealRenderTarget(viewer, sdkInstance);
    renderTarget.setConfig(new StoryBookConfig());
    return renderTarget;
  }, [viewer]);

  const renderTargetRef = useRef<RevealRenderTarget | undefined>(renderTarget);
  const isRevealContainerMountedRef = useRef<boolean>(true);
  const sceneLoadedRef = useRef<SceneIdentifiers>();
  const fdmNodeCache = useRef<FdmNodeCache | undefined>();
  const assetMappingCache = useRef<AssetMappingAndNode3DCache | undefined>();
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
