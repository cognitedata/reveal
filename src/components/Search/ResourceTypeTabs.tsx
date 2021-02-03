import React from 'react';
import { ResourceType } from 'types';
import { Tabs } from 'components';
import { ResourceIcons } from 'components/ResourceIcons/ResourceIcons';
import styled from 'styled-components';

const resourceTypeMap: Record<ResourceType, string> = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time series',
  sequence: 'Sequences',
};
const defaultResourceTypes: ResourceType[] = [
  'asset',
  'timeSeries',
  'file',
  'event',
  'sequence',
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
  <Tabs
    tab={currentResourceType}
    onTabChange={tab => setCurrentResourceType(tab as ResourceType)}
  >
    {resourceTypes.map(key => {
      const type = key as ResourceType;
      return (
        <Tabs.Pane
          key={type}
          title={
            <TabContainer>
              <ResourceIcons style={{ marginRight: 12 }} type={type} />
              {resourceTypeMap[type]}
            </TabContainer>
          }
        />
      );
    })}
  </Tabs>
);

const TabContainer = styled.div`
  display: flex;
  align-items: center;
`;
