import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  ViewerState,
} from '@cognite/reveal';

import {
  getStateUrl,
  THREE_D_ASSET_DETAILS_EXPANDED_QUERY_PARAMETER_KEY as EXPANDED_KEY,
  THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY as SELECTED_ASSET_KEY,
  THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY as VIEW_STATE_KEY,
} from './utils';

type ThreeDContext = {
  viewer?: Cognite3DViewer;
  setViewer: Dispatch<SetStateAction<Cognite3DViewer | undefined>>;
  threeDModel?: Cognite3DModel;
  set3DModel: Dispatch<SetStateAction<Cognite3DModel | undefined>>;
  pointCloudModel?: CognitePointCloudModel;
  setPointCloudModel: Dispatch<
    SetStateAction<CognitePointCloudModel | undefined>
  >;
  viewState?: ViewerState;
  setViewState: Dispatch<SetStateAction<ViewerState | undefined>>;
  selectedAssetId?: number;
  setSelectedAssetId: Dispatch<SetStateAction<number | undefined>>;
  assetDetailsExpanded: boolean;
  setAssetDetailsExpanded: Dispatch<SetStateAction<boolean>>;
};

export const ThreeDContext = createContext<ThreeDContext>({
  assetDetailsExpanded: false,
  setSelectedAssetId: () => {},
  setAssetDetailsExpanded: () => {},
  setViewState: () => {},
  setViewer: () => {},
  set3DModel: () => {},
  setPointCloudModel: () => {},
});
ThreeDContext.displayName = 'ThreeDContext';

const getInitialState = () => {
  const initialParams = new URLSearchParams(window.location.search);

  const viewState = (() => {
    const s = initialParams.get(VIEW_STATE_KEY);
    try {
      if (s) {
        return JSON.parse(s) as ViewerState;
      }
      return undefined;
    } catch {
      return undefined;
    }
  })();

  const selectedAssetId = (() => {
    const s = initialParams.get(SELECTED_ASSET_KEY);
    const n = !!s ? parseInt(s, 10) : undefined;

    if (!!s && Number.isFinite(n)) {
      return n;
    } else {
      return undefined;
    }
  })();

  const expanded = initialParams.get(EXPANDED_KEY) === 'true';
  return {
    viewState,
    selectedAssetId,
    expanded,
  };
};

export const ThreeDContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const {
    expanded: initialExpanded,
    selectedAssetId: initialSelectedAssetId,
    viewState: initialViewState,
  } = useMemo(() => getInitialState(), []);

  const [viewer, setViewer] = useState<Cognite3DViewer | undefined>();
  const [threeDModel, set3DModel] = useState<Cognite3DModel | undefined>();
  const [pointCloudModel, setPointCloudModel] = useState<
    CognitePointCloudModel | undefined
  >();
  const [viewState, setViewState] = useState<ViewerState | undefined>(
    initialViewState
  );
  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>(
    initialSelectedAssetId
  );
  const [assetDetailsExpanded, setAssetDetailsExpanded] =
    useState<boolean>(initialExpanded);

  useEffect(() => {
    window.history.replaceState(
      {},
      '',
      getStateUrl({ selectedAssetId, viewState, assetDetailsExpanded })
    );
  }, [assetDetailsExpanded, selectedAssetId, viewState]);

  return (
    <ThreeDContext.Provider
      value={{
        viewer,
        setViewer,
        threeDModel,
        set3DModel,
        pointCloudModel,
        setPointCloudModel,
        viewState,
        setViewState,
        selectedAssetId,
        setSelectedAssetId,
        assetDetailsExpanded,
        setAssetDetailsExpanded,
      }}
    >
      {children}
    </ThreeDContext.Provider>
  );
};
