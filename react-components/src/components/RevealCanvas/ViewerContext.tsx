import { type DataSourceType, type Cognite3DViewer } from '@cognite/reveal';
import { createContext, type ReactElement, type ReactNode, useContext, useEffect } from 'react';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { remove } from 'lodash';
import { type ComponentFactory } from '../Architecture/Factories/ComponentFactory';

type ViewerContextContent = {
  renderTarget?: RevealRenderTarget;
  componentFactory?: ComponentFactory;
};

export const ViewerContext = createContext<ViewerContextContent | null>(null);

export type ViewerContextProviderProps = {
  renderTarget?: RevealRenderTarget;
  componentFactory?: ComponentFactory;
  children: ReactNode;
};

export const ViewerContextProvider = ({
  renderTarget,
  componentFactory,
  children
}: ViewerContextProviderProps): ReactElement => {
  useExposeRenderTargetAndViewerSingletons(renderTarget ?? undefined);
  useAddRenderTargetToWindowList(renderTarget ?? undefined);

  return (
    <ViewerContext.Provider value={{ renderTarget, componentFactory }}>
      {children}
    </ViewerContext.Provider>
  );
};

export const useReveal = (): Cognite3DViewer<DataSourceType> => {
  const renderTarget = useRenderTarget();
  return renderTarget.viewer;
};

export const useRenderTarget = (): RevealRenderTarget => {
  const renderTarget = useContext(ViewerContext)?.renderTarget;
  if (renderTarget === undefined) {
    throw new Error('useRenderTarget must be used within a ViewerProvider');
  }
  return renderTarget;
};

export const useComponentFactory = (): ComponentFactory => {
  const componentFactory = useContext(ViewerContext)?.componentFactory;
  if (componentFactory === undefined) {
    throw new Error('useComponentFactory must be used within a ViewerProvider');
  }
  return componentFactory;
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
