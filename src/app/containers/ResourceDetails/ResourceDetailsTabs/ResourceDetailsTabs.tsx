import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Tabs, TabPaneProps } from 'lib/components';
import { ResourceType, ResourceItem, getTitle } from 'lib/types';
import { useRelatedResourceCounts } from 'lib/hooks/RelationshipHooks';
import { Badge } from '@cognite/cogs.js';
import { lightGrey } from 'lib/utils/Colors';
import { useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { notification } from 'antd';
import { usePermissions } from 'lib/hooks/CustomHooks';
import { RelatedResources } from 'app/containers/ResourceDetails/RelatedResources/RelatedResources';

type ResouceDetailsTabsProps = {
  parentResource: ResourceItem;
  tab: string;
  additionalTabs?: React.ReactElement<TabPaneProps>[];
  excludedTypes?: ResourceType[];
  onTabChange: (tab: string) => void;
  style?: React.CSSProperties;
};

const defaultRelationshipTabs: ResourceType[] = [
  'asset',
  'file',
  'timeSeries',
  'event',
  'sequence',
];

const ResourceDetailTabContent = ({
  resource,
  type,
}: {
  resource: ResourceItem;
  type: ResourceType;
}) => {
  const history = useHistory();

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
    <RelatedResources
      type={type}
      parentResource={resource}
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
  style = { paddingLeft: '16px' },
}: ResouceDetailsTabsProps) => {
  const { counts } = useRelatedResourceCounts(parentResource);
  const {
    data: relationshipPermission,
    isFetched: permissionFetched,
  } = usePermissions('relationshipsAcl', 'READ');

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
        <ResourceDetailTabContent
          resource={parentResource}
          type={key as ResourceType}
        />
      </Tabs.Pane>
    ));
  const tabs = [...additionalTabs, ...relationshipTabs];

  useEffect(() => {
    if (permissionFetched && !relationshipPermission) {
      notification.warning({
        key: 'relationshipsAcl',
        message: 'Permissions missing',
        description: (
          <>
            Related resources could not be looked up because you do not have
            access to the relationship feature. Add
            &apos;relationships:read&apos; to your service account in{' '}
            <a href={createLink('/access-management')}>access management</a>.
          </>
        ),
        duration: 60,
      });
    }
  }, [permissionFetched, relationshipPermission]);

  return (
    <Tabs tab={tab} onTabChange={onTabChange} style={style}>
      {tabs}
    </Tabs>
  );
};

export const TabTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;
