import { useRef, type ReactElement, useMemo } from 'react';
import { RevealKeepAliveContext } from '../../src/components/RevealKeepAlive/RevealKeepAliveContext';
import { RevealCanvas } from '../../src/components/RevealCanvas/RevealCanvas';
import { type CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { createSdkByUrlToken } from './createSdkByUrlToken';
import {
  RevealContext,
  type RevealContextProps
} from '../../src/components/RevealContext/RevealContext';
import { type SceneIdentifiers } from '../../src/components/SceneContainer/sceneTypes';
import { RevealRenderTarget } from '../../src/architecture/base/renderTarget/RevealRenderTarget';
import { StoryBookConfig } from './StoryBookConfig';

type RevealStoryContainerProps = Omit<RevealContextProps, 'sdk'> & {
  sdk?: CogniteClient;
  viewer?: Cognite3DViewer<DataSourceType>;
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
      viewer = new Cognite3DViewer<DataSourceType>({
        ...rest.viewerOptions,
        sdk: sdkInstance,
        // @ts-expect-error use local models
        _localModels: isLocal,
        hasEventListeners: false,
        useFlexibleCameraManager: true
      });
    }

    const renderTarget = new RevealRenderTarget(viewer, sdkInstance, {
      coreDmOnly: rest.useCoreDm
    });

    renderTarget.setConfig(new StoryBookConfig());
    return renderTarget;
  }, [viewer]);

  const renderTargetRef = useRef<RevealRenderTarget | undefined>(renderTarget);
  const isRevealContainerMountedRef = useRef<boolean>(true);
  const sceneLoadedRef = useRef<SceneIdentifiers>();

  return (
    <RevealKeepAliveContext.Provider
      value={{
        renderTargetRef,
        isRevealContainerMountedRef,
        sceneLoadedRef
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
