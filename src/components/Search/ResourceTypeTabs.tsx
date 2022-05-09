import React from 'react';
import { ResourceType } from 'types';
import { Colors, Tabs } from '@cognite/cogs.js';
import { ResourceIcons } from 'components/ResourceIcons/ResourceIcons';
import styled from 'styled-components';

const resourceTypeMap: Record<ResourceType, string> = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time series',
  sequence: 'Sequences',
  threeD: '3D',
};
const defaultResourceTypes: ResourceType[] = [
  'asset',
  'timeSeries',
  'file',
  'event',
  'sequence',
  'threeD',
];

type Props = {
  resourceTypes?: ResourceType[];
  currentResourceType: ResourceType;
  setCurrentResourceType: (newResourceType: ResourceType) => void;
};

export const ResourceTypeTabs = ({
  currentResourceType,
  setCurrentResourceType,
  resourceTypes = defaultResourceTypes,
}: Props) => (
  <StyledTabs
    activeKey={currentResourceType}
    onChange={tab => setCurrentResourceType(tab as ResourceType)}
  >
    {resourceTypes.map(key => {
      const type = key as ResourceType;
      return (
        <Tabs.TabPane
          key={type}
          tab={
            <TabContainer>
              <ResourceIcons style={{ marginRight: 12 }} type={type} />
              {resourceTypeMap[type]}
            </TabContainer>
          }
        />
      );
    })}
  </StyledTabs>
);

const StyledTabs = styled(Tabs)`
  .rc-tabs-nav-wrap {
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
`;

const TabContainer = styled.div`
  display: flex;
  align-items: center;
`;
