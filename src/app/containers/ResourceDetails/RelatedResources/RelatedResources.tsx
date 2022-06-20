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
} from '@cognite/data-exploration';
import { Select } from '@cognite/cogs.js';

import styled from 'styled-components';
import { useFlag } from '@cognite/react-feature-flags';

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
  const isGroupingFilesEnabled = useFlag(
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
    annotatedWithCount,
    isFetched,
  } = useRelatedResourceCount(parentResource, type);

  const getRelatedResourceType = () => {
    let types: TypeOption[] = [
      {
        label: `Relationships (${relationshipCount})`,
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

  return (
    <RelatedResourcesContainer>
      <FilterWrapper>
        <h4 style={{ marginBottom: 0 }}>Filter by:</h4>
        <SelectWrapper>
          <Select
            value={selectedType as any}
            onChange={setSelectedType}
            options={relatedResourceTypes}
            styles={selectStyles}
            closeMenuOnSelect
          />
        </SelectWrapper>
      </FilterWrapper>
      <TableOffsetHeightWrapper>
        {selectedType?.value === 'relationship' && (
          <RelationshipTable
            parentResource={parentResource}
            type={type}
            {...props}
          />
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
  height: calc(100% - 170px);
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
  padding-left: 16px;
  height: 100%;
`;

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SelectWrapper = styled.div`
  width: 225px;
  margin: 20px;
`;
