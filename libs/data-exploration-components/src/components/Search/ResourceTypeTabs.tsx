import { ResourceType } from '@data-exploration-components/types';
import styled from 'styled-components/macro';
import { useResultCount } from '@data-exploration-components/components/ResultCount/ResultCount';
import { Colors, TabProps, Tabs } from '@cognite/cogs.js';
import {
  getChipRightPropsForResourceCounter,
  getTabCountLabel,
} from '@data-exploration-components/utils';

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
  additionalTabs?: React.ReactElement<TabProps>[];
};

const ResourceTypeTab = ({
  currentResourceType,
  query,
  filter,
  showCount = false,
  ...rest
}: { filter: any } & Omit<
  Props,
  'setCurrentResourceType' | 'isDocumentEnabled' | 'additionalTabs'
> &
  TabProps) => {
  const result = useResultCount({
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
    type: currentResourceType as ResourceType,
  });
  const chipRightProps = getChipRightPropsForResourceCounter(
    getTabCountLabel(result.count),
    showCount,
    result.isLoading
  );

  return (
    <Tabs.Tab
      label={resourceTypeMap[currentResourceType as ResourceType]}
      {...chipRightProps}
      {...rest}
    />
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
  const resourceTabs = resourceTypes.map((resourceType) => {
    return (
      <ResourceTypeTab
        key={resourceType}
        tabKey={resourceType}
        currentResourceType={resourceType}
        filter={globalFilters?.[resourceType] || {}}
        {...rest}
      />
    );
  });
  const tabs = [...additionalTabs, ...resourceTabs];

  return (
    <StyledTabs
      activeKey={currentResourceType || 'all'}
      onTabClick={(tab) => {
        setCurrentResourceType(tab);
      }}
    >
      {tabs}
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
