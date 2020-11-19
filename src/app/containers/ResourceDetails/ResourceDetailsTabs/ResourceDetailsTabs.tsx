import React, { useContext } from 'react';
import styled from 'styled-components';
import { Tabs, TabPaneProps } from 'lib/components';
import {
  ResourceType,
  ResourceItem,
  convertResourceType,
  getTitle,
} from 'lib/types';
import { useList } from '@cognite/sdk-react-query-hooks';
import {
  useRelationships,
  useRelatedResourceCounts,
} from 'lib/hooks/RelationshipHooks';
import { Badge } from '@cognite/cogs.js';
import { lightGrey } from 'lib/utils/Colors';
import { RelationshipTable, Resource } from 'lib/containers/Relationships';
import { useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';

type ResouceDetailsTabsProps = {
  parentResource: ResourceItem;
  tab: string;
  additionalTabs?: React.ReactElement<TabPaneProps>[];
  excludedTypes?: ResourceType[];
  onTabChange: (tab: string) => void;
};

const defaultRelationshipTabs: ResourceType[] = [
  'asset',
  'file',
  'timeSeries',
  'event',
  'sequence',
];

const RelationshipTabContent = ({
  resource,
  type,
}: {
  resource: ResourceItem;
  type: ResourceType;
}) => {
  const history = useHistory();

  const { data: linkedResources } = useList(
    convertResourceType(type),
    {
      filter: { assetSubtreeIds: [{ id: resource.id }] },
    },
    { enabled: resource.type === 'asset' && !!resource.id }
  );

  const { data: relationships } = useRelationships(resource.externalId, [type]);
  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );

  const isSelected = (item: ResourceItem) => {
    return resourcesState.some(
      el =>
        el.state === 'selected' && el.id === item.id && el.type === item.type
    );
  };

  return (
    <RelationshipTable
      type={type}
      relationships={relationships}
      linkedResources={linkedResources as Resource[]}
      onItemClicked={(id: number) => {
        history.push(createLink(`/explore/${type}/${id}`));
      }}
      selectionMode={mode}
      onSelect={onSelect}
      isSelected={isSelected}
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
    .filter(type => !excludedTypes.includes(type))
    .map(key => (
      <Tabs.Pane
        disabled={counts[key] === '0'}
        key={key}
        title={
          <>
            <TabTitle>{getTitle(key)}</TabTitle>
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
