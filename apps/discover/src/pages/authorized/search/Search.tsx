﻿import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch } from 'react-redux';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  useHistory,
} from 'react-router-dom';

import get from 'lodash/get';

import { Loader, Tabs, Badge } from '@cognite/cogs.js';

import { formatBigNumbersWithSuffix } from '_helpers/number';
import { HorizontalResizableBox } from 'components/horizontal-resizable-box/HorizontalResizableBox';
import navigation from 'constants/navigation';
import { useAnythingHasSearched } from 'hooks/useAnythingHasSearched';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { useResponsive } from 'hooks/useResponsive';
import { documentSearchActions } from 'modules/documentSearch/actions';
import { useDocumentResultCount } from 'modules/documentSearch/hooks/useDocumentResultCount';
import { MapCache } from 'modules/map/useMapCache';
import {
  setResultPanelWidth,
  setActivePanel,
} from 'modules/resultPanel/actions';
import { useResultPanelWidth } from 'modules/resultPanel/selectors';
import { useSearchState } from 'modules/search/selectors';
import { setCategoryPage } from 'modules/sidebar/actions';
import { useFilterBarIsOpen } from 'modules/sidebar/selectors';
import { Modules, CategoryTypes } from 'modules/sidebar/types';
import { initializeWellInspect } from 'modules/wellInspect/actions';
import { wellSearchActions } from 'modules/wellSearch/actions';

import { BetaSymbol } from '../elements';

import {
  DOCUMENT_TAB_TITLE_KEY,
  SEISMIC_TAB_TITLE_KEY,
  WELLS_TAB_TITLE_KEY,
} from './constants';
import DocumentSearch from './document';
import DocInspect from './document/inspect';
import {
  OuterMapWrapper,
  OuterSearchWrapper,
  MainSearchContainer,
  MapBoxContainer,
  TabsWrapper,
  Container,
  TabPaneBadgeWrapper,
} from './elements';
import { SideBar } from './search/SideBar';
import SeismicSearch from './seismic';
import WellSearch from './well';
import WellInspect from './well/inspect';

import './search.css';

const Map = React.lazy(() => import(/* webpackChunkName: "map" */ './map/Map'));

const SEARCH_BAR_WIDTH_WELL_INSPECT = 650; // in px
const SEARCH_BAR_WIDTH_DOC_INSPECT = 1000; // in px

interface TabPaneContentProps {
  text: string;
  count?: number;
  displayBetaSymbol?: boolean;
  displayCount?: boolean;
}

interface TabItem {
  id: number;
  name: string;
  path: string;
  title: string;
  total?: number;
  projectConfigKey: Modules;
}

const TabPaneContent: React.FC<TabPaneContentProps> = ({
  text,
  count,
  displayBetaSymbol,
  displayCount,
}) => {
  return (
    <>
      <span>{text}</span>
      {displayBetaSymbol && <BetaSymbol />}
      {displayCount && (
        <TabPaneBadgeWrapper>
          <Badge
            text={formatBigNumbersWithSuffix(count || 0).toString()}
            size={12}
          />
        </TabPaneBadgeWrapper>
      )}
    </>
  );
};

export const Search: React.FC = () => {
  const metrics = useGlobalMetrics('search');
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  // const { data: stats } = useStatsFindQuery();
  const isOpen = useFilterBarIsOpen();
  const anythingHasSearched = useAnythingHasSearched();
  // INFO:Disabled after talking to Sam. Needs to be defined properly
  // const [tabTotals, setTabTotals] = React.useState<{ [total: string]: number }>(
  //   {}
  // );
  const responsive = useResponsive();

  const { t } = useTranslation();
  // const showDashboard = useFlag(DASHBOARD_TOTALS);

  const { data: projectConfig } = useProjectConfig();
  const { showSearchResults } = useSearchState();
  const resultPanelWidth = useResultPanelWidth();

  const documentResultCount = useDocumentResultCount();

  const wellInspectMode = location.pathname.includes(
    navigation.SEARCH_WELLS_INSPECT
  );
  const docInspectMode = location.pathname.includes(
    navigation.SEARCH_DOCUMENTS_INSPECT
  );
  const inspectMode = wellInspectMode || docInspectMode;
  const inspectModeWidth = wellInspectMode
    ? SEARCH_BAR_WIDTH_WELL_INSPECT
    : SEARCH_BAR_WIDTH_DOC_INSPECT;

  /**
   * In case use has adjusted result panel size, try restore width from state
   */
  const RESULT_PANEL_DEFAULT_WIDTH_EXPANDED =
    resultPanelWidth || responsive.Inspect.MAX_SIZE;

  const horizontalResizableBoxWidth = inspectMode
    ? inspectModeWidth
    : RESULT_PANEL_DEFAULT_WIDTH_EXPANDED;

  const horizontalResizableBoxMinWidth = inspectMode
    ? responsive.Inspect.MIN_SIZE
    : responsive.ResultPanel.MIN_SIZE;

  const horizontalResizableBoxMaxWidth = inspectMode
    ? responsive.Inspect.MAX_SIZE
    : responsive.ResultPanel.MAX_SIZE;

  let mapContainer: any = null;
  let searchContainer: any = null;

  const items: TabItem[] = useMemo(
    () =>
      [
        {
          id: 1,
          name: 'Documents',
          projectConfigKey: Modules.DOCUMENTS,
          path: navigation.SEARCH_DOCUMENTS,
          title: t('Documents'),
          total: undefined,
        },
        {
          id: 2,
          name: 'Seismic',
          projectConfigKey: Modules.SEISMIC,
          path: navigation.SEARCH_SEISMIC,
          title: t('Seismic'),
          total: undefined,
        },
        {
          id: 3,
          name: 'Wells',
          projectConfigKey: Modules.WELLS,
          path: navigation.SEARCH_WELLS,
          title: t('Wells'),
          total: undefined,
        },
      ].filter((tab) =>
        projectConfig
          ? // only show tabs that are not disabled
            !projectConfig[tab.projectConfigKey]?.disabled
          : // hide all tabs till project config is loaded
            false
      ),
    [projectConfig]
  );

  const selectedItem = useMemo(
    () => items.find((y) => y.path === location.pathname)?.projectConfigKey,
    [items, location.pathname]
  );

  useEffect(() => {
    if (selectedItem) {
      dispatch(setActivePanel(selectedItem));
    }
  }, [selectedItem]);

  useEffect(() => {
    batch(() => {
      dispatch(documentSearchActions.initialize());
      dispatch(wellSearchActions.initialize());
      dispatch(initializeWellInspect());
    });
  }, []);

  // INFO: this is related to the other disabled stuff about displaying the total in the tabs
  /*  React.useEffect(() => {
    if (showDashboard && stats) {
      if ('documents' in stats) {
        setTabTotals({
          Documents: stats.documents.total,
          Wells: stats.wells.total,
          Seismic: stats.seismic.total,
        });
      }
    }
  }, [showDashboard]); */

  const handleNavigation = (tabKey: string) => {
    const tabItem = items.find((item) => item.projectConfigKey === tabKey);
    if (tabKey && tabItem) {
      metrics.track(`click-${tabKey.toLowerCase()}-tab`);
      history.push(tabItem.path);

      // INFO: Remove this to switch back to old behaviour
      dispatch(setCategoryPage(tabKey as CategoryTypes));
    }
  };

  /**
   * Change the map container width on resize of inspect tables
   * Fire window resize event to expand the map svg elements
   */
  const onResize = (width: number) => {
    dispatch(setResultPanelWidth(width));
    if (mapContainer) {
      mapContainer.style.width = `calc(100% - ${width}px)`;
      window.dispatchEvent(new Event('resize'));
    }
  };

  // Set map container width to balance space of search container only if in inspect mode
  const setMapContainer = (el: HTMLDivElement | null) => {
    if (!anythingHasSearched) return;
    mapContainer = el;
    if (mapContainer) {
      mapContainer.style.width = `calc(100% - ${get(
        searchContainer,
        'parentElement.style.width'
      )})`;
    }
  };

  // INFO: might be used later
  /* const getTabDisplayName = (tab: TabItem) => {
    const tabTotal = tabTotals[tab.name];

    if (tabTotal === undefined || tabTotal === 0) {
      return tab.name;
    }

    return `${tab.name} (${formatBigNumbersWithSuffix(tabTotal)})`;
  }; */

  const defaultPage = () => {
    if (projectConfig && !projectConfig.documents?.disabled) {
      return navigation.SEARCH_DOCUMENTS;
    }

    if (projectConfig && !projectConfig.seismic?.disabled) {
      return navigation.SEARCH_SEISMIC;
    }

    return navigation.SEARCH_WELLS;
  };

  const SearchContent = useMemo(
    () => (
      <OuterSearchWrapper
        expandedMode={showSearchResults}
        ref={(el: HTMLDivElement | null) => {
          searchContainer = el;
        }}
      >
        {/* {anythingHasSearched && !inspectMode && <SearchReset />} */}
        {!inspectMode && (
          <TabsWrapper data-testid="result-panel-tabs">
            {projectConfig && (
              <Tabs activeKey={selectedItem} onChange={handleNavigation}>
                {!projectConfig[Modules.DOCUMENTS]?.disabled && (
                  <Tabs.TabPane
                    key={Modules.DOCUMENTS}
                    tab={
                      <TabPaneContent
                        text={t(DOCUMENT_TAB_TITLE_KEY)}
                        count={documentResultCount}
                        displayCount={
                          projectConfig &&
                          !projectConfig?.general?.hideFilterCount
                        }
                      />
                    }
                  />
                )}

                {!projectConfig[Modules.SEISMIC]?.disabled && (
                  <Tabs.TabPane
                    key={Modules.SEISMIC}
                    tab={
                      <TabPaneContent
                        text={t(SEISMIC_TAB_TITLE_KEY)}
                        displayBetaSymbol
                      />
                    }
                  />
                )}

                {!projectConfig[Modules.WELLS]?.disabled && (
                  <Tabs.TabPane
                    key={Modules.WELLS}
                    tab={<TabPaneContent text={t(WELLS_TAB_TITLE_KEY)} />}
                  />
                )}
              </Tabs>
            )}
          </TabsWrapper>
        )}
        <Switch>
          <Redirect
            from={`${navigation.SEARCH_DOCUMENTS}/welldata`} // old backward compat urls
            to={navigation.SEARCH_WELLS}
          />
          <Redirect
            from={`${navigation.SEARCH_DOCUMENTS}/seismicdata`} // old backward compat urls
            to={navigation.SEARCH_SEISMIC}
          />
          <Route path={navigation.SEARCH_WELLS_INSPECT} render={WellInspect} />
          <Route
            path={navigation.SEARCH_DOCUMENTS_INSPECT}
            render={DocInspect}
          />
          <Route path={navigation.SEARCH_DOCUMENTS} render={DocumentSearch} />
          <Route path={navigation.SEARCH_SEISMIC} render={SeismicSearch} />
          <Route path={navigation.SEARCH_WELLS} render={WellSearch} />
          <Redirect from={navigation.SEARCH} to={defaultPage()} />
        </Switch>
      </OuterSearchWrapper>
    ),
    [items, showSearchResults, selectedItem, documentResultCount, inspectMode]
  );

  // we need the config to be setup before we proceed
  if (!projectConfig) {
    return null;
  }

  if (wellInspectMode) {
    return SearchContent;
  }

  return (
    <Container data-testid="search-container">
      <SideBar />
      <MainSearchContainer isOpen={isOpen}>
        <MapBoxContainer>
          {showSearchResults && (
            <HorizontalResizableBox
              width={horizontalResizableBoxWidth}
              minWidth={horizontalResizableBoxMinWidth}
              maxWidth={horizontalResizableBoxMaxWidth}
              onResize={onResize}
            >
              {SearchContent}
            </HorizontalResizableBox>
          )}
          <MapCache>
            <OuterMapWrapper
              expandedMode={showSearchResults}
              ref={setMapContainer}
            >
              <React.Suspense fallback={<Loader darkMode={false} />}>
                <Map />
              </React.Suspense>
            </OuterMapWrapper>
          </MapCache>
        </MapBoxContainer>
      </MainSearchContainer>
    </Container>
  );
};
