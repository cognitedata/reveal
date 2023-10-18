import { useState, useEffect } from 'react';

import styled from 'styled-components';

import { AssetsOfResourceSearchResults } from '@data-exploration/containers';

import { Select } from '@cognite/cogs.js';
import {
  RelationshipTableProps,
  SelectableItemsProps,
  convertResourceType,
  RelatedResourceType,
  LinkedResourceTable,
  AnnotationTable,
  AnnotatedWithTable,
  RelationshipFilters,
  useRelatedResourceCount,
  RelationshipTableV2,
} from '@cognite/data-exploration';
import { RelationshipResourceType } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';
import {
  useRelatedResourcesCount,
  useRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { EXPLORATION } from '../../../constants/metrics';
import {
  useFlagDocumentsApiEnabled,
  useFlagFileCategorization,
  useFlagNewCounts,
} from '../../../hooks';
import { trackUsage } from '../../../utils/Metrics';
import { addPlusSignToCount } from '../../../utils/stringUtils';

type TypeOption = {
  label: string;
  value: RelatedResourceType;
  count: number;
};

export const RelatedResources = ({
  parentResource,
  type,
  onItemClicked: onItemClickedProp,
  onParentAssetClick,
  ...props
}: RelationshipTableProps & SelectableItemsProps) => {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState<TypeOption>();
  const isGroupingFilesEnabled = useFlagFileCategorization();
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();
  const isNewCountsEnabled = useFlagNewCounts();

  const {
    relationshipCount = 0,
    linkedResourceCount = 0,
    assetIdCount,
    annotationCount,
    hasMoreRelationships,
    isFetched,
  } = useRelatedResourceCount(parentResource, type, isDocumentsApiEnabled);

  const { data: newCount, isLoading } = useRelatedResourcesCount({
    resource: parentResource,
    resourceType: type,
    isDocumentsApiEnabled,
  });

  const relationshipsCount = isNewCountsEnabled
    ? newCount.relationshipsCount
    : relationshipCount;
  const assetIdsCount = isNewCountsEnabled
    ? newCount.directlyLinkedResourcesCount
    : assetIdCount;
  const linkedResourcesCount = isNewCountsEnabled
    ? newCount.linkedResourcesCount
    : linkedResourceCount;
  const annotationsCount = isNewCountsEnabled
    ? newCount.annotationsCount
    : annotationCount;

  const resourceType = convertResourceType(type);
  const resourceTypeTranslationKey = `RESOURCE_TYPE_${resourceType.toUpperCase()}`;
  const resourceTypeTranslated = t(resourceTypeTranslationKey, resourceType);

  const getRelatedResourceType = () => {
    let types: TypeOption[] = [
      {
        label: `${t('RELATIONSHIPS', 'Relationships')} (${
          isNewCountsEnabled
            ? relationshipsCount
            : addPlusSignToCount(relationshipCount, hasMoreRelationships)
        })`,
        value: 'relationship',
        count: relationshipsCount,
      },
    ];

    if (type === 'asset') {
      types = [
        {
          label: `${t('ASSET_ID', 'Asset ID')} (${assetIdsCount})`,
          value: 'assetId',
          count: assetIdsCount,
        },
        ...types,
      ];
    }

    if (parentResource.type === 'asset') {
      types = [
        {
          label: t(
            'LINKED_RESOURCE_TYPE',
            `Linked ${resourceType} (${linkedResourcesCount})`,
            {
              resourceType: resourceTypeTranslated,
              count: linkedResourcesCount,
            }
          ),
          value: 'linkedResource',
          count: linkedResourcesCount,
        },
        ...types,
      ];
    }

    if (parentResource.type === 'file') {
      types = [
        {
          label: `${t('ANNOTATIONS', 'Annotations')} (${annotationsCount})`,
          value: 'annotation',
          count: annotationsCount,
        },
        ...types,
      ];
    }

    return types;
  };

  const onItemClicked = (id: number) => {
    trackUsage('Exploration.Preview.OpenedFrom', selectedType);
    onItemClickedProp(id);
  };

  const relatedResourceTypes = getRelatedResourceType();

  useEffect(
    () => {
      setSelectedType(
        relatedResourceTypes.find(
          (relatedResourceType) => relatedResourceType.count > 0
        ) || relatedResourceTypes[0]
      );
    },

    // Should NOT set state when relatedResourceTypes changes!
    // eslint-disable-next-line
    [isLoading, isFetched, linkedResourcesCount]
  );

  const [selectedRelationshipLabels, setSelectedRelationshipLabels] =
    useState<string[]>();

  const { data: relationshipLabels } = useRelationshipLabels({
    resourceExternalId: parentResource.externalId,
    relationshipResourceTypes: [type as RelationshipResourceType],
  });

  return (
    <RelatedResourcesContainer>
      <FilterWrapper>
        <SelectWrapper>
          <Select
            title={`${t('FILTER_BY', 'Filter By')}:`}
            placeholder={t('SELECT_PLACEHOLDER', 'Select...')}
            value={selectedType}
            onChange={(newType: TypeOption) => {
              setSelectedType(newType);
              trackUsage(EXPLORATION.SELECT.FILTER_BY, { type: newType });
            }}
            options={relatedResourceTypes}
            styles={selectStyles}
            closeMenuOnSelect
          />
        </SelectWrapper>
        {selectedType?.value === 'relationship' && (
          <RelationshipFilters
            options={relationshipLabels}
            onChange={(labels) => {
              setSelectedRelationshipLabels(labels);
              trackUsage(EXPLORATION.SELECT.RELATIONSHIP_LABEL, {
                labels,
                type,
              });
            }}
            value={selectedRelationshipLabels}
          />
        )}
      </FilterWrapper>
      <TableOffsetHeightWrapper>
        {selectedType?.value === 'relationship' && (
          <>
            <RelationshipTableV2
              parentResource={parentResource}
              type={type}
              isGroupingFilesEnabled={isGroupingFilesEnabled}
              onItemClicked={onItemClicked}
              onParentAssetClick={onParentAssetClick}
              labels={selectedRelationshipLabels}
              isDocumentsApiEnabled={isDocumentsApiEnabled}
              {...props}
            />
          </>
        )}

        {selectedType?.value === 'linkedResource' && (
          <LinkedResourceTable
            isGroupingFilesEnabled={isGroupingFilesEnabled}
            parentResource={parentResource}
            isDocumentsApiEnabled={isDocumentsApiEnabled}
            type={type}
            onItemClicked={onItemClicked}
            onParentAssetClick={onParentAssetClick}
            {...props}
          />
        )}

        {selectedType?.value === 'assetId' && (
          <AssetsOfResourceSearchResults
            resource={parentResource}
            onItemClicked={onItemClicked}
            isDocumentsApiEnabled={isDocumentsApiEnabled}
            {...props}
          />
        )}

        {selectedType?.value === 'annotation' && (
          <AnnotationTable
            parentResource={parentResource}
            type={type}
            onItemClicked={onItemClicked}
            onParentAssetClick={onParentAssetClick}
            {...props}
          />
        )}

        {selectedType?.value === 'annotatedWith' && (
          <AnnotatedWithTable
            resource={parentResource}
            isGroupingFilesEnabled={isGroupingFilesEnabled}
            onItemClicked={onItemClicked}
            {...props}
          />
        )}
      </TableOffsetHeightWrapper>
    </RelatedResourcesContainer>
  );
};

const TableOffsetHeightWrapper = styled.div`
  min-height: 200px;
  flex: 1;
`;
const selectStyles = {
  option: (styles: any) => ({
    ...styles,
    cursor: 'pointer',
  }),
  control: (styles: any) => ({
    ...styles,
    cursor: 'pointer',
  }),
};

const RelatedResourcesContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  padding-bottom: 0;
  gap: 10px;
`;

const SelectWrapper = styled.div`
  width: 300px;
`;
