import { useState, useEffect } from 'react';

import styled from 'styled-components';

import { Select } from '@cognite/cogs.js';
import {
  RelationshipTable,
  RelationshipTableProps,
  SelectableItemsProps,
  convertResourceType,
  AssetIdTable,
  RelatedResourceType,
  LinkedResourceTable,
  AnnotationTable,
  AnnotatedWithTable,
  RelationshipFilters,
  useRelatedResourceResults,
} from '@cognite/data-exploration';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import {
  useFlagDocumentsApiEnabled,
  useFlagFileCategorization,
} from '@data-exploration-app/hooks/flags';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { RelationshipLabels, useTranslation } from '@data-exploration-lib/core';
import { useRelatedResourcesCount } from '@data-exploration-lib/domain-layer';

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

  const {
    data: {
      relationshipsCount,
      assetIdsCount,
      linkedResourcesCount,
      annotationsCount,
    },
    isLoading,
  } = useRelatedResourcesCount({
    resource: parentResource,
    resourceType: type,
    isDocumentsApiEnabled,
  });

  const resourceType = convertResourceType(type);

  const getRelatedResourceType = () => {
    let types: TypeOption[] = [
      {
        label: `${t('RELATIONSHIPS', 'Relationships')} (${relationshipsCount})`,
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
            { resourceType, count: linkedResourcesCount }
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
    [isLoading, linkedResourcesCount]
  );
  const { relationshipLabelOptions, onChangeLabelValue, labelValue } =
    useRelatedResourceResults<RelationshipLabels>(
      selectedType?.value || 'linkedResource',
      type,
      parentResource
    );

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
            options={relationshipLabelOptions}
            onChange={(labels) => {
              onChangeLabelValue(labels);
              trackUsage(EXPLORATION.SELECT.RELATIONSHIP_LABEL, {
                labels,
                type,
              });
            }}
            value={labelValue}
          />
        )}
      </FilterWrapper>
      <TableOffsetHeightWrapper>
        {selectedType?.value === 'relationship' && (
          <>
            <RelationshipTable
              parentResource={parentResource}
              type={type}
              isGroupingFilesEnabled={isGroupingFilesEnabled}
              onItemClicked={onItemClicked}
              onParentAssetClick={onParentAssetClick}
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
          <AssetIdTable
            resource={parentResource}
            onItemClicked={onItemClicked}
            {...props}
          />
        )}

        {selectedType?.value === 'annotation' && (
          <AnnotationTable
            fileId={parentResource.id}
            resourceType={type}
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
