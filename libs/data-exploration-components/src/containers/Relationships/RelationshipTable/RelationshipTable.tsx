import React, { useContext } from 'react';
import { Alert } from 'antd';

import {
  ResourceItem,
  ResourceType,
  SelectableItemsProps,
} from '@data-exploration-components/types';

import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { createLink } from '@cognite/cdf-utilities';
import { A } from '@cognite/cogs.js';
import { AppContext } from '@data-exploration-lib/core';
import { RelationshipAssetTable } from './RelationshipAssetTable';
import { RelationshipEventTable } from './RelationshipEventTable';
import { RelationshipFileTable } from './RelationshipFileTable';
import { RelationshipSequenceTable } from './RelationshipSequenceTable';
import { RelationshipTimeseriesTable } from './RelationshipTimeseriesTable';

export type RelationshipTableProps = {
  type: ResourceType;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
  onParentAssetClick: (assetId: number) => void;
  isGroupingFilesEnabled?: boolean;
};
const relationshipMapper = {
  asset: RelationshipAssetTable,
  sequence: RelationshipSequenceTable,
  timeSeries: RelationshipTimeseriesTable,
  event: RelationshipEventTable,
  file: RelationshipFileTable,
};

export const RelationshipTable = ({
  type,
  parentResource,
  onItemClicked,
  onParentAssetClick,
  isGroupingFilesEnabled,
}: RelationshipTableProps & SelectableItemsProps) => {
  const context = useContext(AppContext);
  const { data: relationshipPermission, isFetched: permissionFetched } =
    usePermissions(
      context?.flow! as any,
      'relationshipsAcl',
      'READ',
      undefined,
      {
        enabled: Boolean(context?.flow),
      }
    );

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

  // Do we show same relationship table for files and documents(files tab when advanced filters disabled)?
  // TODO needs to add the table related to documents
  if (type === 'threeD') return null;

  const RelationshipMappedTable = relationshipMapper[type];

  return (
    <RelationshipMappedTable
      parentResource={parentResource}
      onItemClicked={onItemClicked}
      onParentAssetClick={onParentAssetClick}
      isGroupingFilesEnabled={isGroupingFilesEnabled}
    />
  );
};
