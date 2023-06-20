import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react';

import { PAGE_DIRECTION_LOCAL_STORAGE_KEY } from '@transformations/common';
import {
  isMappingMode,
  isSourceRawTable,
  getTransformationMapping,
} from '@transformations/components/source-mapping/utils';
import { RawExplorerContextProvider } from '@transformations/contexts';
import {
  QueryPreviewSuccess,
  useSchema,
  useTransformationPreview,
} from '@transformations/hooks/transformation';
import { Job, TransformationRead } from '@transformations/types';
import {
  PREVIEW_ROW_LIMIT_OPTIONS,
  PREVIEW_SOURCE_LIMIT_OPTIONS,
  getRawTabKey,
  validateQueryBeforeRun,
} from '@transformations/utils';

import { IconType } from '@cognite/cogs.js';

import { RawTableIcon } from './styled-components';
import { TransformationSideMenuItem } from './TransformationDetailsSideMenu';

export type InspectSectionKey = 'browse-source' | 'preview' | 'run-history';
const DEFAULT_SELECTED_INSPECT_SECTION: InspectSectionKey = 'preview';

export type PreviewRowLimit = (typeof PREVIEW_ROW_LIMIT_OPTIONS)[number];
export type PreviewSourceLimit = (typeof PREVIEW_SOURCE_LIMIT_OPTIONS)[number];

export type PageLayout = 'both' | 'editor-only' | 'inspect-only';
export type PageDirection = 'horizontal' | 'vertical';

export type TransformationContextT = {
  isSidebarVisible: boolean;
  setIsSidebarVisible: Dispatch<SetStateAction<boolean>>;
  activeSidePanelKey?: TransformationSideMenuItem;
  setActiveSidePanelKey: Dispatch<
    SetStateAction<TransformationSideMenuItem | undefined>
  >;
  activeTabKey?: string;
  tabs: TransformationTab[];
  addTab: (tab: TransformationTab) => void;
  removeTab: (tabKey: string) => void;
  removeTabs: (tabKeys: string[]) => void;
  selectTab: (tabKey: string) => void;
  pageLayout: PageLayout;
  setPageLayout: Dispatch<SetStateAction<PageLayout>>;
  pageDirection: PageDirection;
  setPageDirection: Dispatch<SetStateAction<PageDirection>>;
  activeInspectSectionKey: InspectSectionKey;
  setActiveInspectSectionKey: Dispatch<SetStateAction<InspectSectionKey>>;
  expandedRunHistoryCards: number[];
  expandRunHistoryCard: (id: number) => void;
  collapseRunHistoryCard: (id: number) => void;
  isScheduleModalOpen: boolean;
  setIsScheduleModalOpen: Dispatch<SetStateAction<boolean>>;
  _setIsScheduleModalOpen: Dispatch<SetStateAction<boolean>>;
  lastPreview: QueryPreviewSuccess | undefined;
  isQueryValid: boolean;
  isScheduleConfirmationModalOpen: boolean;
  _setIsScheduleConfirmationModalOpen: Dispatch<SetStateAction<boolean>>;
};

export type PreviewRun = {
  type: 'preview';
  limit: PreviewRowLimit;
  sourceLimit: PreviewSourceLimit;
  query: string;
  transformationId: number;
};

type TransformationTabBase = {
  key: string;
  icon?: IconType | JSX.Element;
  title: string | React.ReactNode;
};

export type PreviewTab = TransformationTabBase & PreviewRun;

export type TransformationTab = {
  key: string;
  icon?: IconType | JSX.Element;
  title: string | React.ReactNode;
  visible?: boolean;
} & (
  | {
      type: 'run-history'; // TODO: remove this type as part of cleaning
      jobId: Job['id'];
    }
  | PreviewRun
  | {
      type: 'raw';
      database: string;
      table: string;
    }
);

export const TransformationContext =
  React.createContext<TransformationContextT>({
    isSidebarVisible: false,
    setIsSidebarVisible: () => {},
    activeSidePanelKey: undefined,
    setActiveSidePanelKey: () => {},
    activeTabKey: undefined,
    tabs: [],
    addTab: () => {},
    removeTab: () => {},
    removeTabs: () => {},
    selectTab: () => {},
    pageLayout: 'both',
    setPageLayout: () => {},
    pageDirection: 'horizontal',
    setPageDirection: () => {},
    activeInspectSectionKey: DEFAULT_SELECTED_INSPECT_SECTION,
    setActiveInspectSectionKey: () => {},
    expandedRunHistoryCards: [],
    expandRunHistoryCard: () => {},
    collapseRunHistoryCard: () => {},
    isScheduleModalOpen: false,
    setIsScheduleModalOpen: () => {},
    lastPreview: undefined,
    isScheduleConfirmationModalOpen: false,
    isQueryValid: false,
    // Should probably not be used directly, setIsScheduleModalOpen will update it if necessary
    _setIsScheduleConfirmationModalOpen: () => {},
    _setIsScheduleModalOpen: () => {},
  });

type Props = {
  children: JSX.Element;
  transformation: TransformationRead;
};
const TransformationContextProvider = ({ children, transformation }: Props) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isScheduleModalOpen, _setIsScheduleModalOpen] = useState(false);
  const [isScheduleConfirmationModalOpen, setIsScheduleConfirmationModalOpen] =
    useState(false);
  const [activeSidePanelKey, setActiveSidePanelKey] = useState<
    TransformationSideMenuItem | undefined
  >();

  function selectInitalSelectedInspectSection() {
    const mappingEnabled = isMappingMode(transformation?.query);
    const selectedInspectSection =
      isSourceRawTable(transformation) && mappingEnabled
        ? 'browse-source'
        : DEFAULT_SELECTED_INSPECT_SECTION;
    return selectedInspectSection;
  }
  const [activeInspectSectionKey, setActiveInspectSectionKey] =
    useState<InspectSectionKey>(selectInitalSelectedInspectSection);

  const [activeTabKey, setActiveTabKey] = useState<string>();

  function selectInitialTabs() {
    const mappingEnabled = isMappingMode(transformation?.query);
    const mapping = getTransformationMapping(transformation.query);
    let tab: TransformationTab | undefined = undefined;

    if (isSourceRawTable(transformation) && mappingEnabled && mapping) {
      tab = {
        type: 'raw',
        database: mapping.sourceLevel1!,
        table: mapping.sourceLevel2!,
        key: getRawTabKey(mapping.sourceLevel1!, mapping.sourceLevel2!),
        title: mapping.sourceLevel2!,
        icon: <RawTableIcon type="DataTable" />,
        visible: true,
      };
    }

    const rawTabFromMappingSource = tab ? [tab] : [];

    return rawTabFromMappingSource;
  }
  const [tabs, setTabs] = useState<TransformationTab[]>(selectInitialTabs);
  const visibleTabs = tabs.filter(({ visible }) => visible);

  const lastPreviewTab = [...tabs]
    .reverse()
    .find(({ type }) => type === 'preview') as PreviewTab | undefined;
  const { data: lastPreview } = useTransformationPreview(
    lastPreviewTab?.query!,
    lastPreviewTab?.limit!,
    lastPreviewTab?.sourceLimit!,
    lastPreviewTab?.key!,
    {
      enabled: false,
    }
  );
  const { data: schema } = useSchema({
    destination: transformation.destination,
    action: transformation.conflictMode,
  });
  const isQueryValid = validateQueryBeforeRun(
    transformation.query,
    lastPreview,
    schema,
    transformation.destination
  );

  const [expandedRunHistoryCards, setExpandedRunHistoryCards] = useState<
    number[]
  >([]);

  const [pageLayout, setPageLayout] = useState<PageLayout>('both');
  const [pageDirection, setPageDirection] = useState<PageDirection>(() => {
    const direction = localStorage.getItem(PAGE_DIRECTION_LOCAL_STORAGE_KEY);
    switch (direction) {
      case 'horizontal':
        return 'horizontal';
      case 'vertical':
        return 'vertical';
      default:
        return 'horizontal';
    }
  });

  useEffect(() => {
    localStorage.setItem(PAGE_DIRECTION_LOCAL_STORAGE_KEY, pageDirection);
  }, [pageDirection]);

  const selectTab = useCallback((tabKey: TransformationTab['key']) => {
    setActiveTabKey(tabKey);
  }, []);

  const addTab = useCallback(
    (tab: Omit<TransformationTab, 'visible'>, shouldSelectTab = true) => {
      setTabs((prevTabs) =>
        prevTabs
          .filter(({ key: testKey }) => testKey !== tab.key)
          .concat([{ ...tab, visible: true } as TransformationTab])
      );
      if (shouldSelectTab) {
        selectTab(tab.key);
      }
    },
    [selectTab]
  );

  const setIsScheduleModalOpen = useCallback(
    (open: SetStateAction<boolean>) => {
      if (open) {
        if (!isQueryValid && !transformation.schedule) {
          setIsScheduleConfirmationModalOpen(true);
        } else {
          _setIsScheduleModalOpen(true);
        }
      } else {
        if (isScheduleConfirmationModalOpen) {
          setIsScheduleConfirmationModalOpen(false);
        } else {
          _setIsScheduleModalOpen(false);
        }
      }
    },
    [isQueryValid, isScheduleConfirmationModalOpen, transformation?.schedule]
  );

  const removeTabs = useCallback(
    (tabKeys: TransformationTab['key'][]) => {
      const filteredTabs = tabs.map((tab) => ({
        ...tab,
        visible: tabKeys.includes(tab.key) ? false : tab.visible,
      }));
      setTabs(filteredTabs);
      if (activeTabKey && tabKeys.includes(activeTabKey)) {
        setActiveTabKey(filteredTabs[0]?.key);
      }
    },
    [activeTabKey, tabs]
  );

  const removeTab = useCallback(
    (tabKey: TransformationTab['key']) => {
      removeTabs([tabKey]);
    },
    [removeTabs]
  );

  const expandRunHistoryCard = (id: number) => {
    setExpandedRunHistoryCards((prevState) => prevState.concat(id));
  };

  const collapseRunHistoryCard = (id: number) => {
    setExpandedRunHistoryCards((prevState) =>
      prevState.filter((currentId) => currentId !== id)
    );
  };

  return (
    <RawExplorerContextProvider>
      <TransformationContext.Provider
        value={{
          isSidebarVisible,
          setIsSidebarVisible,
          activeSidePanelKey,
          setActiveSidePanelKey,
          activeTabKey,
          tabs: visibleTabs,
          addTab,
          removeTab,
          removeTabs,
          selectTab,
          pageLayout,
          setPageLayout,
          pageDirection,
          setPageDirection,
          activeInspectSectionKey,
          setActiveInspectSectionKey,
          expandedRunHistoryCards,
          expandRunHistoryCard,
          collapseRunHistoryCard,
          isScheduleModalOpen,
          setIsScheduleModalOpen,
          _setIsScheduleModalOpen,
          lastPreview,
          isQueryValid,
          isScheduleConfirmationModalOpen,
          _setIsScheduleConfirmationModalOpen:
            setIsScheduleConfirmationModalOpen,
        }}
      >
        {children}
      </TransformationContext.Provider>
    </RawExplorerContextProvider>
  );
};

export const useTransformationContext = () => useContext(TransformationContext);

export default TransformationContextProvider;
