import { useContext } from 'react';

import {
  AssetRelatedSearchResults,
  EventRelatedSearchResults,
  FileRelatedSearchResults,
  SequenceRelatedSearchResults,
  TimeseriesRelatedSearchResults,
} from '@data-exploration/containers';
import { Alert } from 'antd';

import { createLink } from '@cognite/cdf-utilities';
import { A } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { AppContext, useTranslation } from '@data-exploration-lib/core';

import { ResourceItem, ResourceType } from '../../types';

export const RelationshipTableV2 = ({
  type,
  parentResource,
  onItemClicked,
  onParentAssetClick,
  isDocumentsApiEnabled = true,
  isGroupingFilesEnabled = true,
}: {
  type: ResourceType;
  isGroupingFilesEnabled?: boolean;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
  onParentAssetClick: (assetId: number) => void;
  labels?: string[];
  isDocumentsApiEnabled?: boolean;
}) => {
  const { t } = useTranslation();
  const context = useContext(AppContext);

  const { data: relationshipPermission, isFetched: permissionFetched } =
    usePermissions('relationshipsAcl', 'READ', undefined, {
      enabled: Boolean(context?.flow),
    });

  // Do we show same relationship table for files and documents(files tab when advanced filters disabled)?
  // TODO needs to add the table related to documents
  if (type === 'threeD') return null;

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

  const resourceExternalId = parentResource.externalId;

  switch (type) {
    case 'asset':
      return (
        <AssetRelatedSearchResults
          resourceExternalId={resourceExternalId}
          onClick={(asset) => onItemClicked(asset.id)}
        />
      );
    case 'event':
      return (
        <EventRelatedSearchResults
          resourceExternalId={resourceExternalId}
          onClick={(event) => onItemClicked(event.id)}
        />
      );
    case 'file':
      return (
        <FileRelatedSearchResults
          resourceExternalId={resourceExternalId}
          onClick={(file) => onItemClicked(file.id)}
          isDocumentsApiEnabled={isDocumentsApiEnabled}
          isGroupingFilesEnabled={isGroupingFilesEnabled}
        />
      );
    case 'sequence':
      return (
        <SequenceRelatedSearchResults
          resourceExternalId={resourceExternalId}
          onClick={(sequence) => onItemClicked(sequence.id)}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesRelatedSearchResults
          resourceExternalId={resourceExternalId}
          onClick={(sequence) => onItemClicked(sequence.id)}
          onParentAssetClick={(asset) => onParentAssetClick(asset.id)}
        />
      );
    default:
      return <>{t('NO_RELATIONSHIPS_FOUND', 'No relationships found')}</>;
  }
};
