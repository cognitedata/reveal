import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';

import { Button, Icon, Menu, Tabs, Dropdown, Loader } from '@cognite/cogs.js';

import navigation from 'constants/navigation';
import { useDeepEffect } from 'hooks/useDeep';
import { useHorizontalScroll } from 'hooks/useHorizontalScroll';
import {
  useWellInspectSelectedWellboreIds,
  useWellInspectWells,
} from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectSelection } from 'modules/wellInspect/selectors';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

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
import { TAB_ITEMS } from './types';
import { WarningModal3D } from './WarningModal3D';

const THREEDEE_TAB_KEY = 'threeDee';
const WARNING_MODAL_LIMIT = 10;

export const WellInspect: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  const { data: config } = useWellConfig();
  const wells = useWellInspectWells();
  const { selectedWellIds } = useWellInspectSelection();
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const [isOpen, setIsOpen] = useState(true);
  const [inspectSidebarWidth, setInspectSidebarWidth] = useState(
    SIDEBAR_SIZE.min
  );
  const scrollRef = useHorizontalScroll();
  const [show3dWarningModal, setShow3dWarningModal] = useState(false);

  useDeepEffect(() => {
    /**
     * This will redirect the app to well search screen if there are no selected wellbores.
     * This Usable when user directly access the inspection screen
     */
    if (isEmpty(selectedWellIds)) history.push(navigation.SEARCH_WELLS);
  }, [selectedWellIds]);

  const items = useMemo(
    () => TAB_ITEMS.filter((item) => config?.[item.key]?.enabled),
    []
  );

  const selectedItem = useMemo(
    () => items.find((y) => y.path === location.pathname),
    [location.pathname]
  );

  const hasTooManyWellboresSelected = useMemo(
    () => wellboreIds.length > WARNING_MODAL_LIMIT,
    [wellboreIds]
  );

  const standalone = selectedItem?.standalone || false;

  const handleNavigation = (tabKey: string) => {
    const tabItem = items.find((item) => item.key === tabKey);
    if (tabItem) {
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
  const tabs = useMemo(
    () =>
      items
        .filter((item) => !item.standalone)
        .map((item) => <Tabs.TabPane key={item.key} tab={t(item.name)} />),
    [items]
  );

  const standaloneItems = items.filter((item) => item.standalone);

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

  if (isEmpty(wells)) {
    return <Loader darkMode={false} />;
  }

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
                  {tabs}
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
