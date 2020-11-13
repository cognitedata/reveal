import React from 'react';
import styled from 'styled-components';
import { Tabs, TabPaneProps } from 'lib/components';
import { ResourceType, ResourceItem, convertResourceType } from 'lib/types';
import { useList } from '@cognite/sdk-react-query-hooks';
import {
  useRelationships,
  useRelatedResourceCounts,
} from 'lib/hooks/RelationshipHooks';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import { Badge } from '@cognite/cogs.js';
import { lightGrey } from 'lib/utils/Colors';
import { RelationshipTable, Resource } from 'lib/containers/Relationships';

type ResouceDetailsTabsProps = {
  parentResource: ResourceItem;
  tab: string;
  additionalTabs?: React.ReactElement<TabPaneProps>[];
  excludedTypes?: ResourceType[];
  onTabChange: (tab: string) => void;
};

const defaultRelationshipTabs: { key: ResourceType; title: string }[] = [
  { key: 'asset', title: 'Assets' },
  { key: 'file', title: 'Files' },
  { key: 'timeSeries', title: 'Time series' },
  { key: 'event', title: 'Events' },
  { key: 'sequence', title: 'Sequences' },
];

const RelationshipTabContent = ({
  resource,
  type,
}: {
  resource: ResourceItem;
  type: ResourceType;
}) => {
  const { openPreview } = useResourcePreview();

  const { data: linkedResources } = useList(
    convertResourceType(type),
    {
      filter: { assetSubtreeIds: [{ id: resource.id }] },
    },
    { enabled: resource.type === 'asset' && !!resource.id }
  );

  const { data: relationships } = useRelationships(resource.externalId, [type]);

  return (
    <RelationshipTable
      type={type}
      relationships={relationships}
      linkedResources={linkedResources as Resource[]}
      onItemClicked={(item: Resource) => {
        openPreview({ item: { id: item.id, type } });
      }}
    />
  );
};

export const ResourceDetailsTabs = ({
  parentResource,
  tab,
  additionalTabs = [],
  excludedTypes = [],
  onTabChange,
}: ResouceDetailsTabsProps) => {
  const { counts } = useRelatedResourceCounts(parentResource);

  const relationshipTabs = defaultRelationshipTabs
    .filter(type => !excludedTypes.includes(type.key))
    .map(({ key, title }) => (
      <Tabs.Pane
        disabled={counts[key] === '0'}
        key={key}
        title={
          <>
            <TabTitle>{title}</TabTitle>
            <Badge text={counts[key]} background={lightGrey} />
          </>
        }
      >
        <RelationshipTabContent
          resource={parentResource}
          type={key as ResourceType}
        />
      </Tabs.Pane>
    ));
  const tabs = [...additionalTabs, ...relationshipTabs];

  return (
    <Tabs tab={tab} onTabChange={onTabChange}>
      {tabs}
    </Tabs>
  );
};

export const TabTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;
