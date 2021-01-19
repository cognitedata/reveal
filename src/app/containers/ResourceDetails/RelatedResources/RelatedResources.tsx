import React, { useState, useEffect, useMemo } from 'react';
import {
  RelationshipTable,
  RelationshipTableProps,
  SelectableItemsProps,
  convertResourceType,
  AssetIdTable,
} from 'lib';
import { Select } from '@cognite/cogs.js';
import { RelatedResourceType } from 'lib/hooks/RelatedResourcesHooks';
import styled from 'styled-components';
import { LinkedResourceTable } from 'lib/containers/Relationships';
import { useRelatedResourceCount } from 'lib/hooks/RelationshipHooks';
import AnnotationTable from 'lib/containers/Relationships/AnnotationTable';
import { AnnotatedWithTable } from 'lib/containers/Relationships/AnnotatedWithTable';

type TypeOption = {
  label: string;
  value: RelatedResourceType;
  count: number;
};

export const RelatedResources = ({
  parentResource,
  type,
  ...props
}: RelationshipTableProps & SelectableItemsProps) => {
  const [selectedType, setSelectedType] = useState<TypeOption>();

  const {
    relationshipCount,
    linkedResourceCount,
    assetIdCount,
    annotationCount,
    annotatedWithCount,
    isFetched,
  } = useRelatedResourceCount(parentResource, type);

  const relatedResourceTypes = useMemo(() => {
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
          count: linkedResourceCount || 0,
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
  }, [
    parentResource,
    type,
    relationshipCount,
    assetIdCount,
    linkedResourceCount,
    annotationCount,
    annotatedWithCount,
  ]);

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
            value={selectedType}
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
  width: 165px;
  margin: 20px;
`;
