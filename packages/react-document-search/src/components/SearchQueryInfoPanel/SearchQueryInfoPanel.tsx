import * as React from 'react';
import {
  Button,
  Dropdown,
  SegmentedControl,
  Title,
  Tooltip,
} from '@cognite/cogs.js';

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

  const handleNavigation = (nextTab: string) => {
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
        <Title level={5}>{SEARCH_QUERY_INFO_HEADER}</Title>
        <Button icon="Close" aria-label="Close" onClick={handleClose} />
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
  const [isOpen, setisOpen] = React.useState<boolean>(false);

  const handleOpen = () => {
    setisOpen(true);
  };
  const handleClose = () => {
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
        <Tooltip content="Show syntax rules" placement="bottom">
          <Button icon="Info" aria-label="Syntax rules" onClick={handleOpen} />
        </Tooltip>
      </MarginLeftContainer>
    </Dropdown>
  );
};
