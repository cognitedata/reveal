import { useResultCount } from '@data-exploration/containers';

import { TabProps, Tabs } from '@cognite/cogs.js';

import { ResourceType } from '../../types';

const resourceTypeMap: Record<ResourceType, string> = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time series',
  sequence: 'Sequences',
  threeD: '3D',
  charts: 'Charts',
};

const defaultResourceTypes: ResourceType[] = [
  'asset',
  'timeSeries',
  'file',
  'event',
  'sequence',
  'threeD',
  'charts',
];

type Props = {
  resourceTypes?: ResourceType[];
  currentResourceType?: string;
  setCurrentResourceType: (tab?: string) => void;
  query?: string;
  globalFilters?: { [key in ResourceType]: any };
  additionalTabs?: React.ReactElement<TabProps>[];
};

const ResourceTypeTab = ({
  currentResourceType,
  query,
  filter,
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

  return (
    <Tabs.Tab
      chipRight={{ label: `${result.count}`, size: 'x-small' }}
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
        label={resourceTypeMap[resourceType]}
        {...rest}
      />
    );
  });
  const tabs = [...additionalTabs, ...resourceTabs];
  return (
    <Tabs
      showTrack
      activeKey={currentResourceType || 'all'}
      onTabClick={(tab) => {
        setCurrentResourceType(tab);
      }}
    >
      {tabs}
    </Tabs>
  );
};
