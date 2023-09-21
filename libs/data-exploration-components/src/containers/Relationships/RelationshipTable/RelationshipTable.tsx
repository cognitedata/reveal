import React, { useContext } from 'react';

import { Alert } from 'antd';

import { createLink } from '@cognite/cdf-utilities';
import { A } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { AppContext, useTranslation } from '@data-exploration-lib/core';

import {
  ResourceItem,
  ResourceType,
  SelectableItemsProps,
} from '../../../types';

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
  labels?: string[];
  isDocumentsApiEnabled?: boolean;
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
  isDocumentsApiEnabled,
  labels,
}: RelationshipTableProps & SelectableItemsProps) => {
  const { t } = useTranslation();
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
        message={t('PERMISSIONS_MISSING', 'Permissions missing')}
        description={
          <>
            {t(
              'RELATIONSHIP_PERMISSIONS_MISSING_ERROR',
              `Related resources could not be looked up because you do not have access to the relationship feature. Add 'relationships:read'; to your service account in`
            )}{' '}
            <A href={createLink('/access-management')}>
              {t('ACCESS_MANAGEMENT_LINK', 'access management')}
            </A>
            .
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
      labels={labels}
      isDocumentsApiEnabled={isDocumentsApiEnabled}
    />
  );
};
