import { useState } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { useConnectedDataElements } from 'scarlet/hooks';
import { DataElement } from 'scarlet/types';

import { CardHeader, CardRemarks, DataSourceList } from '..';

import * as Styled from './style';

type CardProps = {
  dataElement: DataElement;
};

enum CardTabs {
  DATA_SOURCES = 'data-sources',
  REMARKS = 'remarks',
}

export const Card = ({ dataElement }: CardProps) => {
  const [currentTab, setCurrentTab] = useState(CardTabs.DATA_SOURCES);
  const connectedDataElements = useConnectedDataElements(dataElement.key);
  const hasConnectedElements = connectedDataElements.length > 1;

  return (
    <Styled.Container>
      <CardHeader dataElement={dataElement} />
      <SegmentedControl
        fullWidth
        currentKey={currentTab}
        onButtonClicked={(value) => setCurrentTab(value as CardTabs)}
      >
        <SegmentedControl.Button key={CardTabs.DATA_SOURCES}>
          Data sources
        </SegmentedControl.Button>
        <SegmentedControl.Button key={CardTabs.REMARKS}>
          Remarks
        </SegmentedControl.Button>
      </SegmentedControl>
      <Styled.ContentWrapper>
        {currentTab === CardTabs.DATA_SOURCES && (
          <Styled.ScrollContainer>
            <DataSourceList
              dataElement={dataElement}
              hasConnectedElements={hasConnectedElements}
            />
          </Styled.ScrollContainer>
        )}
        {currentTab === CardTabs.REMARKS && (
          <Styled.ScrollContainer>
            <CardRemarks dataElement={dataElement} />
          </Styled.ScrollContainer>
        )}
      </Styled.ContentWrapper>
    </Styled.Container>
  );
};
