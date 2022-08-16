import { useWellInspectWells } from 'domain/wells/well/internal/hooks/useWellInspectWells';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { Button, Icon, Menu, Tabs, Dropdown } from '@cognite/cogs.js';
import { PerfMetrics } from '@cognite/metrics';

import { WELL_INSPECT_ID } from 'constants/metrics';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useHorizontalScroll } from 'hooks/useHorizontalScroll';
import { useTranslation } from 'hooks/useTranslation';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useInspectStateFromUrl } from 'modules/wellInspect/hooks/useInspectStateFromUrl';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

import {
  InspectContainer,
  InspectContent,
  LinkNode,
  LinksMenu,
  TabsContent,
  TabsScrollWrapper,
  TabsWrapper,
} from './elements';
import InspectRouter from './InspectRouter';
import { ScrollButtons } from './ScrollButtons';
import { SIDEBAR_SIZE } from './Sidebar/constants';
import { InspectSidebar } from './Sidebar/InspectSidebar';
import StandaloneHeader from './StandaloneHeader';
import { useTabs } from './useTabs';
import { WarningModal3D } from './WarningModal3D';

const THREEDEE_TAB_KEY = 'threeDee';
const WARNING_MODAL_LIMIT = 10;

export const WellInspect: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  useInspectStateFromUrl();

  const { wells, error } = useWellInspectWells();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const tabs = useTabs();

  useEffect(() => {
    if (isUndefined(error)) return;
    /**
     * If wells are not fetched and error is present, redirect to home page
     */
    if (isEmpty(wells) && !isUndefined(error)) {
      history.push(navigation.SEARCH);
    }
  }, [error]);

  const [isOpen, setIsOpen] = useState(true);
  const [inspectSidebarWidth, setInspectSidebarWidth] = useState(
    SIDEBAR_SIZE.min
  );
  const scrollRef = useHorizontalScroll();
  const [show3dWarningModal, setShow3dWarningModal] = useState(false);
  const metrics = useGlobalMetrics(WELL_INSPECT_ID);

  const selectedItem = useMemo(
    () => tabs.find((y) => y.path === location.pathname),
    [location.pathname]
  );

  const hasTooManyWellboresSelected = useMemo(
    () => wellboreIds.length > WARNING_MODAL_LIMIT,
    [wellboreIds]
  );

  const standalone = selectedItem?.standalone || false;

  const handleNavigation = (tabKey: string) => {
    const tabItem = tabs.find((item) => item.key === tabKey);
    if (tabItem) {
      /**
       * Clear errors in side bar
       */
      dispatch(inspectTabsActions.resetErrors());
      PerfMetrics.trackPerfStart(`${tabKey.toUpperCase()}_PAGE_LOAD`);
      metrics.track(`click-${tabKey}-tab`);
      history.push(tabItem.path);
    }
  };

  const onNavigateToStandaloneItemsClick = (tabKey: string) => {
    if (tabKey !== THREEDEE_TAB_KEY) {
      handleNavigation(tabKey);
      return;
    }
    if (hasTooManyWellboresSelected) {
      setShow3dWarningModal(true);
    } else {
      handleNavigation(THREEDEE_TAB_KEY);
    }
  };

  const handleSidebarToggle = () => {
    setIsOpen((state) => !state);
    // This is to rerender 'Other' links dropdown in correct position
    // Better solution would be extending cog.js to support hover events
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  };

  const onOpenThreedeeConfirm = () => {
    setShow3dWarningModal(false);
    handleNavigation(THREEDEE_TAB_KEY);
  };

  const onCloseThreedeeWarningModal = () => {
    setShow3dWarningModal(false);
  };

  // Standard tabs
  const standardTabs = useMemo(
    () =>
      tabs
        .filter((tab) => !tab.standalone)
        .map((tab) => <Tabs.TabPane key={tab.key} tab={t(tab.name)} />),
    [tabs]
  );

  const standaloneItems = tabs.filter((tab) => tab.standalone);

  // Other links (Multiple ppfgs, 3d etc)
  const links = useMemo(
    () => (
      <LinksMenu>
        {standaloneItems.map((item) => (
          <Menu.Item
            key={item.key}
            onClick={() => {
              onNavigateToStandaloneItemsClick(item.key);
            }}
          >
            <LinkNode>
              <span>{t(item.name)}</span>
              <Icon type="ArrowUpRight" size={16} />
            </LinkNode>
          </Menu.Item>
        ))}
      </LinksMenu>
    ),
    [standaloneItems]
  );

  const width = `calc(100% - ${
    isOpen ? inspectSidebarWidth : SIDEBAR_SIZE.closed
  }px)`;

  return (
    <>
      <InspectContainer>
        <InspectSidebar
          hidden={standalone}
          isOpen={isOpen}
          width={inspectSidebarWidth}
          onToggle={handleSidebarToggle}
          onResize={setInspectSidebarWidth}
        />

        <InspectContent
          standalone={standalone}
          fullWidth={!isOpen}
          width={width}
        >
          <ScrollButtons scrollRef={scrollRef}>
            <TabsWrapper>
              <TabsScrollWrapper ref={scrollRef}>
                <Tabs
                  hidden={standalone}
                  activeKey={selectedItem?.key}
                  onChange={handleNavigation}
                  data-testid="well-inspect-navigation-tabs"
                >
                  {standardTabs}
                </Tabs>
                {!standalone && standaloneItems.length > 1 && (
                  <Dropdown content={links} openOnHover>
                    <Button
                      type="ghost"
                      size="small"
                      id="link-tabs"
                      aria-label="Other"
                      iconPlacement="right"
                      icon="ChevronDown"
                    >
                      {t('Other')}
                    </Button>
                  </Dropdown>
                )}
                {!standalone && standaloneItems.length === 1 && (
                  <Button
                    type="ghost"
                    size="small"
                    id="single-link-tabs"
                    aria-label={standaloneItems[0].name}
                    onClick={() => {
                      onNavigateToStandaloneItemsClick(standaloneItems[0].key);
                    }}
                  >
                    <span>{standaloneItems[0].name}</span>
                    <Icon type="ArrowUpRight" size={16} />
                  </Button>
                )}
              </TabsScrollWrapper>
              <StandaloneHeader
                title={selectedItem?.name || ''}
                hidden={!standalone}
              />
            </TabsWrapper>
          </ScrollButtons>
          <TabsContent>
            <InspectRouter />
          </TabsContent>
        </InspectContent>
      </InspectContainer>
      <WarningModal3D
        show3dWarningModal={show3dWarningModal}
        onConfirm={onOpenThreedeeConfirm}
        onCancel={onCloseThreedeeWarningModal}
      />
    </>
  );
};

export default WellInspect;
