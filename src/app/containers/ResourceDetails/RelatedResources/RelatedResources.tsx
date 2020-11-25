import React, { useState, useEffect, useMemo } from 'react';
import {
  RelationshipTable,
  RelationshipTableProps,
  SelectableItemsProps,
  convertResourceType,
  Loader,
} from 'lib';
import { Select } from '@cognite/cogs.js';
import { RelatedResourceType } from 'lib/hooks/RelatedResourcesHooks';
import styled from 'styled-components';
import { LinkedResourceTable } from 'lib/containers/Relationships/LinkedResourceTable';
import { useRelatedResourceCount } from 'lib/hooks/RelationshipHooks';

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
    isFetched,
  } = useRelatedResourceCount(parentResource, type);

  const relatedResourceTypes = useMemo(() => {
    const types: TypeOption[] = [
      {
        label: `Relationships (${relationshipCount})`,
        value: 'relationship',
        count: relationshipCount,
      },
    ];

    if (parentResource.type === 'asset') {
      types.push({
        label: `Linked ${convertResourceType(type)} (${linkedResourceCount})`,
        value: 'linkedResource',
        count: linkedResourceCount || 0,
      });
    }

    return types;
  }, [parentResource, type, relationshipCount, linkedResourceCount]);

  useEffect(
    () =>
      setSelectedType(
        relatedResourceTypes.find(t => t.count > 0) || relatedResourceTypes[0]
      ),
    [isFetched, relatedResourceTypes]
  );

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <>
      <FilterWrapper>
        <h4 style={{ marginBottom: 0 }}>Filter by:</h4>
        <SelectWrapper>
          <Select
            value={selectedType}
            onChange={setSelectedType}
            options={relatedResourceTypes}
            closeMenuOnSelect
          />
        </SelectWrapper>
      </FilterWrapper>

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
    </>
  );
};

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SelectWrapper = styled.div`
  width: 165px;
  margin: 20px;
`;
