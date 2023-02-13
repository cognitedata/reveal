import React from 'react';
import { ResourceType } from '@data-exploration-components/types';
import { Chip, Colors, TabProps, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { useResultCount } from '@data-exploration-components/components/ResultCount/ResultCount';

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
  currentResourceType?: string;
  setCurrentResourceType: (tab?: string) => void;
  query?: string;
  globalFilters?: { [key in ResourceType]: any };
  showCount?: boolean;
  additionalTabs?: any;
};

const ResourceTypeTab = ({
  currentResourceType,
  query,
  filter,
  showCount = false,
}: { filter: any } & Omit<
  Props,
  'setCurrentResourceType' | 'isDocumentEnabled' | 'additionalTabs'
>) => {
  const result = useResultCount({
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
    type: currentResourceType as ResourceType,
  });

  return (
    <TabContainer>
      <ResourceTypeTitle>
        {resourceTypeMap[currentResourceType as ResourceType]}
      </ResourceTypeTitle>
      {showCount && (
        <Chip size="small" type="default" label={String(result.count)} />
      )}
    </TabContainer>
  );
};
export const ResourceTypeTabs = ({
  currentResourceType = 'all',
  setCurrentResourceType,
  resourceTypes = defaultResourceTypes,
  additionalTabs = [],
  globalFilters,
  ...rest
}: Props) => {
  return (
    <StyledTabs
      activeKey={currentResourceType}
      onTabClick={(tab) => setCurrentResourceType(tab)}
    >
      {additionalTabs}
      {resourceTypes.map((resourceType) => {
        return (
          <Tabs.Tab tabKey={resourceType} label={resourceType}>
            <ResourceTypeTab
              currentResourceType={resourceType}
              filter={globalFilters?.[resourceType] || {}}
              {...rest}
            />
          </Tabs.Tab>
        );
      })}
    </StyledTabs>
  );
};

const StyledTabs = styled(Tabs)`
  .rc-tabs-nav-wrap {
    border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
  }
`;

const TabContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ResourceTypeTitle = styled.div`
  margin-right: 8px;
`;
