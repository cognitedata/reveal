import React, { useState, useEffect } from 'react';
import {
  RelationshipTable,
  RelationshipTableProps,
  SelectableItemsProps,
  convertResourceType,
  AssetIdTable,
  RelatedResourceType,
  LinkedResourceTable,
  useRelatedResourceCount,
  AnnotationTable,
  AnnotatedWithTable,
  RelationshipFilters,
  useRelatedResourceResults,
  RelationshipLabels,
} from '@cognite/data-exploration';
import { Select } from '@cognite/cogs.js';

import styled from 'styled-components';
import { useFlag } from '@cognite/react-feature-flags';
import { addPlusSignToCount } from 'app/utils/stringUtils';

type TypeOption = {
  label: string;
  value: RelatedResourceType;
  count: number;
};

export const DATA_EXPLORATION_DOCUMENT_CATEGORISATION =
  'DATA_EXPLORATION_document_categorisation';

export const RelatedResources = ({
  parentResource,
  type,
  ...props
}: RelationshipTableProps & SelectableItemsProps) => {
  const [selectedType, setSelectedType] = useState<TypeOption>();

  // Adding the flag to manually enable this feature to categorize the documents
  const { isEnabled: isGroupingFilesEnabled } = useFlag(
    DATA_EXPLORATION_DOCUMENT_CATEGORISATION,
    {
      forceRerender: true,
    }
  );

  const {
    relationshipCount,
    linkedResourceCount = 0,
    assetIdCount,
    annotationCount,
    hasMoreRelationships,
    annotatedWithCount,
    isFetched,
  } = useRelatedResourceCount(parentResource, type);

  const getRelatedResourceType = () => {
    let types: TypeOption[] = [
      {
        label: `Relationships (${addPlusSignToCount(
          relationshipCount,
          hasMoreRelationships
        )})`,
        value: 'relationship',
        count: relationshipCount,
      },
    ];

    if (type === 'asset') {
      types = [
        {
          label: `Asset ID (${assetIdCount})`,
          value: 'assetId',
          count: assetIdCount,
        },
        ...types,
      ];
    }

    if (parentResource.type === 'asset') {
      types = [
        {
          label: `Linked ${convertResourceType(type)} (${linkedResourceCount})`,
          value: 'linkedResource',
          count: linkedResourceCount,
        },
        ...types,
      ];
    }

    if (parentResource.type === 'file') {
      types = [
        {
          label: `Annotations (${annotationCount})`,
          value: 'annotation',
          count: annotationCount,
        },
        ...types,
      ];
    }

    if (type === 'file') {
      types = [
        {
          label: `Appears in (${annotatedWithCount})`,
          value: 'annotatedWith',
          count: annotatedWithCount,
        },
        ...types,
      ];
    }

    return types;
  };

  const relatedResourceTypes = getRelatedResourceType();

  useEffect(
    () =>
      setSelectedType(
        relatedResourceTypes.find(t => t.count > 0) || relatedResourceTypes[0]
      ),
    // Should NOT set state when relatedResourceTypes changes!
    // eslint-disable-next-line
    [isFetched, linkedResourceCount]
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
            title="Filter By:"
            value={selectedType as any}
            onChange={setSelectedType}
            options={relatedResourceTypes}
            styles={selectStyles}
            closeMenuOnSelect
          />
        </SelectWrapper>
        {selectedType?.value === 'relationship' && (
          <RelationshipFilters
            options={relationshipLabelOptions}
            onChange={onChangeLabelValue}
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
              {...props}
            />
          </>
        )}

        {selectedType?.value === 'linkedResource' && (
          <LinkedResourceTable
            isGroupingFilesEnabled={isGroupingFilesEnabled}
            excludeParentResource
            parentResource={parentResource}
            type={type}
            {...props}
          />
        )}

        {selectedType?.value === 'assetId' && (
          <AssetIdTable resource={parentResource} {...props} />
        )}

        {selectedType?.value === 'annotation' && (
          <AnnotationTable
            fileId={parentResource.id}
            resourceType={type}
            {...props}
          />
        )}

        {selectedType?.value === 'annotatedWith' && (
          <AnnotatedWithTable resource={parentResource} {...props} />
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
