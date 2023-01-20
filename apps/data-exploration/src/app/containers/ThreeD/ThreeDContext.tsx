import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  ViewerState,
} from '@cognite/reveal';

import {
  getStateUrl,
  THREE_D_ASSET_DETAILS_EXPANDED_QUERY_PARAMETER_KEY as EXPANDED_KEY,
  THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY as SELECTED_ASSET_KEY,
  THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY as VIEW_STATE_KEY,
  THREE_D_SLICING_STATE_QUERY_PARAMETER_KEY as SLICING_STATE_KEY,
  THREE_D_SECONDARY_MODELS_QUERY_PARAMETER_KEY as SECONDARY_MODELS_KEY,
  THREE_D_REVISION_ID_QUERY_PARAMETER_KEY as REVISION_KEY,
  THREE_D_ASSET_HIGHLIGHT_MODE_PARAMETER_KEY as HL_MODE_KEY,
  THREE_D_CUBEMAP_360_IMAGES_QUERY_PARAMETER_KEY as CUBEMAP_360_IMAGES_KEY,
} from './utils';
import { useDefault3DModelRevision } from './hooks';
import { Loader } from '@cognite/cogs.js';
import { ResourceTabType } from '@data-exploration-app/containers/ThreeD/NodePreview';
import { SmartOverlayTool } from '@data-exploration-app/containers/ThreeD/tools/SmartOverlayTool';
import noop from 'lodash/noop';

export type SecondaryModelOptions = {
  modelId: number;
  revisionId: number;
  applied?: boolean;
};

export type CubemapDatasetOptions = {
  siteId: string;
  siteName: string;
  applied?: boolean;
  rotationMatrix?: THREE.Matrix4;
  translationMatrix?: THREE.Matrix4;
};

export type SlicingState = {
  top: number;
  bottom: number;
};

type ThreeDContext = {
  viewer?: Cognite3DViewer;
  setViewer: Dispatch<SetStateAction<Cognite3DViewer | undefined>>;
  overlayTool?: SmartOverlayTool;
  setOverlayTool: Dispatch<SetStateAction<SmartOverlayTool | undefined>>;
  threeDModel?: CogniteCadModel;
  set3DModel: Dispatch<SetStateAction<CogniteCadModel | undefined>>;
  pointCloudModel?: CognitePointCloudModel;
  setPointCloudModel: Dispatch<
    SetStateAction<CognitePointCloudModel | undefined>
  >;
  viewState?: ViewerState;
  setViewState: Dispatch<SetStateAction<ViewerState | undefined>>;
  slicingState?: SlicingState;
  setSlicingState: Dispatch<SetStateAction<SlicingState | undefined>>;
  selectedAssetId?: number;
  setSelectedAssetId: Dispatch<SetStateAction<number | undefined>>;
  revisionId?: number;
  setRevisionId: Dispatch<SetStateAction<number | undefined>>;
  assetDetailsExpanded: boolean;
  setAssetDetailsExpanded: Dispatch<SetStateAction<boolean>>;
  assetHighlightMode: boolean;
  setAssetHighlightMode: Dispatch<SetStateAction<boolean>>;
  splitterColumnWidth: number;
  setSplitterColumnWidth: Dispatch<SetStateAction<number>>;
  tab?: ResourceTabType;
  setTab: Dispatch<SetStateAction<ResourceTabType | undefined>>;
  secondaryModels: SecondaryModelOptions[];
  setSecondaryModels: Dispatch<SetStateAction<SecondaryModelOptions[]>>;
  cubemap360Images: CubemapDatasetOptions[];
  setCubemap360Images: Dispatch<SetStateAction<CubemapDatasetOptions[]>>;
};

const DETAILS_COLUMN_WIDTH = '@cognite/3d-details-column-width';
const DEFAULT_COLUMN_WIDTH = 400;

export const ThreeDContext = createContext<ThreeDContext>({
  assetDetailsExpanded: false,
  assetHighlightMode: false,
  splitterColumnWidth: DEFAULT_COLUMN_WIDTH,
  setSelectedAssetId: noop,
  setAssetDetailsExpanded: noop,
  setViewState: noop,
  setSlicingState: noop,
  setViewer: noop,
  setOverlayTool: noop,
  set3DModel: noop,
  setPointCloudModel: noop,
  setSplitterColumnWidth: noop,
  setRevisionId: noop,
  setTab: noop,
  secondaryModels: [],
  setSecondaryModels: noop,
  setAssetHighlightMode: noop,
  cubemap360Images: [],
  setCubemap360Images: noop,
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

  const slicingState = (() => {
    const s = initialParams.get(SLICING_STATE_KEY);
    try {
      if (s) {
        return JSON.parse(s) as SlicingState;
      }
      return undefined;
    } catch {
      return undefined;
    }
  })();

  const selectedAssetId = (() => {
    const s = initialParams.get(SELECTED_ASSET_KEY);
    const n = s ? parseInt(s, 10) : undefined;

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
        return models.map((model) => ({ ...model, applied: true }));
      }
      return [];
    } catch {
      return [];
    }
  })();

  const cubemap360Images = (() => {
    const searchParams = initialParams.get(CUBEMAP_360_IMAGES_KEY);
    try {
      if (searchParams) {
        const cubemaps = JSON.parse(searchParams) as Pick<
          CubemapDatasetOptions,
          // TODO: add rotationMatrix & translationMatrix once it is available from backend
          'siteId' | 'siteName'
        >[];
        return cubemaps.map((cubemap) => ({ ...cubemap, applied: true }));
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
    const n = s ? parseInt(s, 10) : undefined;
    return Number.isFinite(n) ? n : undefined;
  })();

  const expanded = initialParams.get(EXPANDED_KEY) === 'true';
  const assetHighlightMode = initialParams.get(HL_MODE_KEY) === 'true';
  return {
    viewState,
    slicingState,
    selectedAssetId,
    expanded,
    revisionId,
    splitterColumnWidth,
    secondaryModels,
    assetHighlightMode,
    cubemap360Images,
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
    slicingState: initialSlicingState,
    splitterColumnWidth: initialSplitterColumnWidth,
    secondaryModels: initialSecondaryModels,
    revisionId: initialRevisionId,
    assetHighlightMode: initialAssetHighlightMode,
    cubemap360Images: initialCubemap360Images,
  } = useMemo(() => getInitialState(), []);

  const [viewer, setViewer] = useState<Cognite3DViewer | undefined>();
  const [overlayTool, setOverlayTool] = useState<
    SmartOverlayTool | undefined
  >();
  const [threeDModel, set3DModel] = useState<CogniteCadModel | undefined>();
  const [pointCloudModel, setPointCloudModel] = useState<
    CognitePointCloudModel | undefined
  >();
  const [viewState, setViewState] = useState<ViewerState | undefined>(
    initialViewState
  );
  const [slicingState, setSlicingState] = useState<SlicingState | undefined>(
    initialSlicingState
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
  const [cubemap360Images, setCubemap360Images] = useState<
    CubemapDatasetOptions[]
  >(initialCubemap360Images);
  const [assetHighlightMode, setAssetHighlightMode] = useState<boolean>(
    initialAssetHighlightMode
  );

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
        slicingState,
        assetDetailsExpanded,
        secondaryModels,
        assetHighlightMode,
      })
    );
  }, [
    assetDetailsExpanded,
    revisionId,
    selectedAssetId,
    viewState,
    slicingState,
    secondaryModels,
    assetHighlightMode,
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DETAILS_COLUMN_WIDTH,
        `${splitterColumnWidth}`
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error in ThreeDContext', e);
    }
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
        overlayTool,
        setOverlayTool,
        threeDModel,
        set3DModel,
        pointCloudModel,
        setPointCloudModel,
        viewState,
        setViewState,
        slicingState,
        setSlicingState,
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
        assetHighlightMode,
        setAssetHighlightMode,
        cubemap360Images,
        setCubemap360Images,
      }}
    >
      {children}
    </ThreeDContext.Provider>
  );
};
