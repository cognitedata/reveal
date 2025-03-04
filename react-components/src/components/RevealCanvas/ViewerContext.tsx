/*!
 * Copyright 2023 Cognite AS
 */
import { type DataSourceType, type Cognite3DViewer } from '@cognite/reveal';
import { createContext, type ReactElement, type ReactNode, useContext, useEffect } from 'react';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { remove } from 'lodash';

const ViewerContext = createContext<RevealRenderTarget | null>(null);

export type ViewerContextProviderProps = {
  value: RevealRenderTarget | null;
  children: ReactNode;
};

export const ViewerContextProvider = ({
  value,
  children
}: ViewerContextProviderProps): ReactElement => {
  useExposeRenderTargetAndViewerSingletons(value ?? undefined);
  useAddRenderTargetToWindowList(value ?? undefined);

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
};

export const useReveal = (): Cognite3DViewer<DataSourceType> => {
  const renderTarget = useRenderTarget();
  return renderTarget.viewer;
};

export const useRenderTarget = (): RevealRenderTarget => {
  const renderTarget = useContext(ViewerContext);
  if (renderTarget === null) {
    throw new Error('useRenderTarget must be used within a ViewerProvider');
  }
  return renderTarget;
};

function useAddRenderTargetToWindowList(renderTarget: RevealRenderTarget | undefined): void {
  useEffect(() => {
    if (renderTarget === undefined) {
      return;
    }

    if (window.renderTargets === undefined) {
      window.renderTargets = [renderTarget];
    } else {
      window.renderTargets.push(renderTarget);
    }

    return () => {
      if (window.renderTargets !== undefined) {
        remove(window.renderTargets, (element) => element === renderTarget);
      }
    };
  }, [renderTarget]);
}

function useExposeRenderTargetAndViewerSingletons(
  renderTarget: RevealRenderTarget | undefined
): void {
  useEffect(() => {
    if (
      renderTarget === undefined ||
      window.renderTarget !== undefined ||
      window.viewer !== undefined
    ) {
      return;
    }

    window.renderTarget = renderTarget;
    window.viewer = renderTarget.viewer;

    return () => {
      if (window.renderTarget?.viewer === renderTarget.viewer) {
        window.viewer = undefined;
      }

      if (window.renderTarget === renderTarget) {
        window.renderTarget = undefined;
      }
    };
  }, [renderTarget]);
}
