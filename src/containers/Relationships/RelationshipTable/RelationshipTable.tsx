import React, { useContext } from 'react';
import { Alert } from 'antd';
import { Asset } from '@cognite/sdk';
import { ResourceType, ResourceItem } from 'types';
import { AssetTable } from 'containers';
import {
  FileSearchResults,
  TimeseriesSearchResults,
  EventSearchResults,
  SequenceSearchResults,
} from 'containers/SearchResults';
import { SelectableItemsProps } from 'CommonProps';
import { ResultTableLoader } from 'containers/ResultTableLoader';
import { useRelationshipCount } from 'hooks/RelationshipHooks';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { createLink } from 'utils/URLUtils';
import { A } from '@cognite/cogs.js';
import { AppContext } from 'context/AppContext';

export type RelationshipTableProps = {
  type: ResourceType;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
};

export const RelationshipTable = ({
  type,
  parentResource,
  onItemClicked,
  ...selectionMode
}: RelationshipTableProps & SelectableItemsProps) => {
  const { data: count } = useRelationshipCount(parentResource, type);

  const context = useContext(AppContext);
  const { data: relationshipPermission, isFetched: permissionFetched } =
    usePermissions(context?.flow!, 'relationshipsAcl', 'READ', undefined, {
      enabled: !!context?.flow,
    });

  if (permissionFetched && !relationshipPermission) {
    return (
      <Alert
        type="warning"
        message="Permissions missing"
        description={
          <>
            Related resources could not be looked up because you do not have
            access to the relationship feature. Add
            &apos;relationships:read&apos; to your service account in{' '}
            <A href={createLink('/access-management')}>access management</A>.
          </>
        }
      />
    );
  }

  switch (type) {
    case 'asset':
      return (
        <ResultTableLoader<Asset>
          mode="relatedResources"
          type="asset"
          relatedResourceType="relationship"
          parentResource={parentResource}
          {...selectionMode}
        >
          {props => (
            <AssetTable
              onRowClick={el => onItemClicked(el.id)}
              {...props}
              relatedResourceType="relationship"
              estimatedRowHeight={100}
            />
          )}
        </ResultTableLoader>
      );
    case 'event':
      return (
        <EventSearchResults
          showRelatedResources
          relatedResourceType="relationship"
          parentResource={parentResource}
          count={count}
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
        />
      );
    case 'file':
      return (
        <FileSearchResults
          showRelatedResources
          relatedResourceType="relationship"
          parentResource={parentResource}
          onClick={el => onItemClicked(el.id)}
          count={count}
          {...selectionMode}
        />
      );
    case 'sequence':
      return (
        <SequenceSearchResults
          showRelatedResources
          relatedResourceType="relationship"
          parentResource={parentResource}
          onClick={el => onItemClicked(el.id)}
          count={count}
          {...selectionMode}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesSearchResults
          showRelatedResources
          relatedResourceType="relationship"
          parentResource={parentResource}
          count={count}
          onClick={el => onItemClicked(el.id)}
          initialView="grid"
          {...selectionMode}
        />
      );
    default:
      return <>No relationships found</>;
  }
};
