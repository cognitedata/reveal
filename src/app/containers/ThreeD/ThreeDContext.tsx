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
  THREE_D_SECONDARY_MODELS_QUERY_PARAMETER_KEY as SECONDARY_MODELS_KEY,
  THREE_D_REVISION_ID_QUERY_PARAMETER_KEY as REVISION_KEY,
} from './utils';
import { useDefault3DModelRevision } from './hooks';
import { Loader } from '@cognite/cogs.js';
import { ResourceTabType } from 'app/containers/ThreeD/NodePreview';

export type SecondaryModelOptions = {
  modelId: number;
  revisionId: number;
  applied?: boolean;
};

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
  revisionId?: number;
  setRevisionId: Dispatch<SetStateAction<number | undefined>>;
  assetDetailsExpanded: boolean;
  setAssetDetailsExpanded: Dispatch<SetStateAction<boolean>>;
  splitterColumnWidth: number;
  setSplitterColumnWidth: Dispatch<SetStateAction<number>>;
  tab?: ResourceTabType;
  setTab: Dispatch<SetStateAction<ResourceTabType | undefined>>;
  secondaryModels: SecondaryModelOptions[];
  setSecondaryModels: Dispatch<SetStateAction<SecondaryModelOptions[]>>;
};

const DETAILS_COLUMN_WIDTH = '@cognite/3d-details-column-width';
const DEFAULT_COLUMN_WIDTH = 400;

export const ThreeDContext = createContext<ThreeDContext>({
  assetDetailsExpanded: false,
  splitterColumnWidth: DEFAULT_COLUMN_WIDTH,
  setSelectedAssetId: () => {},
  setAssetDetailsExpanded: () => {},
  setViewState: () => {},
  setViewer: () => {},
  set3DModel: () => {},
  setPointCloudModel: () => {},
  setSplitterColumnWidth: () => {},
  setRevisionId: () => {},
  setTab: () => {},
  secondaryModels: [],
  setSecondaryModels: () => {},
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

  const secondaryModels = (() => {
    const s = initialParams.get(SECONDARY_MODELS_KEY);
    try {
      if (s) {
        const models = JSON.parse(s) as Pick<
          SecondaryModelOptions,
          'modelId' | 'revisionId'
        >[];
        return models.map(model => ({ ...model, applied: true }));
      }
      return [];
    } catch {
      return [];
    }
  })();

  const splitterColumnWidth = (() => {
    try {
      const lsNumber = parseInt(
        window.localStorage.getItem(DETAILS_COLUMN_WIDTH) || '',
        10
      );
      return Number.isFinite(lsNumber) ? lsNumber : DEFAULT_COLUMN_WIDTH;
    } catch {
      return DEFAULT_COLUMN_WIDTH;
    }
  })();

  const revisionId = (() => {
    const s = initialParams.get(REVISION_KEY);
    const n = !!s ? parseInt(s, 10) : undefined;
    return Number.isFinite(n) ? n : undefined;
  })();

  const expanded = initialParams.get(EXPANDED_KEY) === 'true';
  return {
    viewState,
    selectedAssetId,
    expanded,
    revisionId,
    splitterColumnWidth,
    secondaryModels,
  };
};

export const ThreeDContextProvider = ({
  modelId,
  children,
}: {
  modelId: number;
  children?: React.ReactNode;
}) => {
  const {
    expanded: initialExpanded,
    selectedAssetId: initialSelectedAssetId,
    viewState: initialViewState,
    splitterColumnWidth: initialSplitterColumnWidth,
    secondaryModels: initialSecondaryModels,
    revisionId: initialRevisionId,
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
  const [revisionId, setRevisionId] = useState<number | undefined>(
    initialRevisionId
  );
  const [splitterColumnWidth, setSplitterColumnWidth] = useState(
    initialSplitterColumnWidth
  );
  const [assetDetailsExpanded, setAssetDetailsExpanded] =
    useState<boolean>(initialExpanded);
  const [secondaryModels, setSecondaryModels] = useState<
    SecondaryModelOptions[]
  >(initialSecondaryModels);

  const {
    isFetching: fetchingDefaultRevision,
    error,
    data: defaultRevision,
  } = useDefault3DModelRevision(modelId, { enabled: !revisionId });

  useEffect(() => {
    if (
      !revisionId &&
      defaultRevision?.id &&
      Number.isFinite(defaultRevision?.id)
    ) {
      setRevisionId(defaultRevision.id);
    }
  }, [defaultRevision?.id, revisionId]);
  const [tab, setTab] = useState<ResourceTabType | undefined>();

  useEffect(() => {
    window.history.replaceState(
      {},
      '',
      getStateUrl({
        revisionId,
        selectedAssetId,
        viewState,
        assetDetailsExpanded,
        secondaryModels,
      })
    );
  }, [
    assetDetailsExpanded,
    revisionId,
    selectedAssetId,
    viewState,
    secondaryModels,
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DETAILS_COLUMN_WIDTH,
        `${splitterColumnWidth}`
      );
    } catch {}
  }, [splitterColumnWidth]);

  if (error) {
    return <>Could not find a revision for model id {modelId}</>;
  }

  if (fetchingDefaultRevision) {
    return <Loader />;
  }

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
        splitterColumnWidth,
        setSplitterColumnWidth,
        revisionId,
        setRevisionId,
        tab,
        setTab,
        secondaryModels,
        setSecondaryModels,
      }}
    >
      {children}
    </ThreeDContext.Provider>
  );
};
