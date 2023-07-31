import * as React from 'react';

import {
  Button,
  Dropdown,
  SegmentedControl,
  Title,
  Tooltip,
} from '@cognite/cogs.js';

import { CloseButton } from 'components/Buttons';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';

import { SEARCH_QUERY_INFO_HEADER, SEARCH_QUERY_INFO_TABS } from './constants';
import {
  Content,
  SyntaxHelperWrapper,
  TitleContainer,
  MarginLeftContainer,
  ContentWrapper,
} from './elements';
import { SyntaxInfoContainer } from './SyntaxInfoContainer';
import {
  OperatorsTab,
  PhrasesTab,
  SpecialCharactersTab,
  OrderingTab,
} from './tabs';
import { SearchQueryInfoTabType } from './types';

interface Props {
  handleClose: () => void;
  isOpen: boolean;
}
export const InfoPanel: React.FC<Props> = ({ handleClose, isOpen }) => {
  const [currentTab, setCurrentTab] =
    React.useState<SearchQueryInfoTabType>('Operators');
  const [tabHeight, setTabHeight] = React.useState<number>();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation('Search');
  const metrics = useGlobalMetrics('search');

  const handleNavigation = (nextTab: string) => {
    metrics.track(
      `click-syntax-help-${nextTab.toLowerCase().replace(' ', '-')}-tab`
    );
    setCurrentTab(nextTab as SearchQueryInfoTabType);
  };

  // Transition the height to the height of the new tab
  React.useEffect(() => {
    if (contentRef.current) {
      setTabHeight(contentRef.current.offsetHeight);
    }
  }, [currentTab]);

  if (!isOpen) {
    return null;
  }

  return (
    <SyntaxHelperWrapper>
      <TitleContainer>
        <Title level={5}>{t(SEARCH_QUERY_INFO_HEADER)}</Title>
        <CloseButton onClick={handleClose} />
      </TitleContainer>
      <SyntaxInfoContainer />
      <SegmentedControl
        currentKey={currentTab}
        onButtonClicked={handleNavigation}
      >
        {SEARCH_QUERY_INFO_TABS.map((tab) => (
          <SegmentedControl.Button key={tab}>{tab}</SegmentedControl.Button>
        ))}
      </SegmentedControl>
      <ContentWrapper height={tabHeight}>
        <Content ref={contentRef}>
          {currentTab === 'Operators' && <OperatorsTab />}
          {currentTab === 'Phrases' && <PhrasesTab />}
          {currentTab === 'Special characters' && <SpecialCharactersTab />}
          {currentTab === 'Ordering' && <OrderingTab />}
        </Content>
      </ContentWrapper>
    </SyntaxHelperWrapper>
  );
};

export const SearchQueryInfoPanel: React.FC = () => {
  const { t } = useTranslation('Search');
  const metrics = useGlobalMetrics('search');
  const [isOpen, setisOpen] = React.useState<boolean>(false);

  const handleOpen = () => {
    metrics.track('click-open-syntax-help-button');
    setisOpen(true);
  };
  const handleClose = () => {
    metrics.track('click-close-syntax-help-button');
    setisOpen(false);
  };

  return (
    <Dropdown
      visible={isOpen}
      onClickOutside={handleClose}
      content={<InfoPanel isOpen={isOpen} handleClose={handleClose} />}
      placement="right-start"
    >
      <MarginLeftContainer>
        <Tooltip content={t('Show syntax rules')} placement="bottom">
          <Button icon="Info" aria-label="Syntax rules" onClick={handleOpen} />
        </Tooltip>
      </MarginLeftContainer>
    </Dropdown>
  );
};
