import React, { useState } from 'react';
import {
  RelationshipTable,
  RelationshipTableProps,
  SelectableItemsProps,
} from 'lib';
import { Select } from '@cognite/cogs.js';
import { RelatedResourceType } from 'lib/hooks/RelatedResourcesHooks';
import styled from 'styled-components';

type TypeOption = {
  label: string;
  value: RelatedResourceType;
};

export const RelatedResources = (
  props: RelationshipTableProps & SelectableItemsProps
) => {
  const relatedResourceTypes: TypeOption[] = [
    { label: 'Relationships', value: 'relationship' },
  ];

  const [selectedType, setSelectedType] = useState<TypeOption>(
    relatedResourceTypes[0]
  );

  return (
    <>
      <FilterWrapper>
        <h4 style={{ marginBottom: 0 }}>Filter by:</h4>
        <SelectWrapper>
          <Select
            value={selectedType}
            onChange={setSelectedType}
            options={relatedResourceTypes}
          />
        </SelectWrapper>
      </FilterWrapper>

      {selectedType.value === 'relationship' && (
        <RelationshipTable {...props} />
      )}
    </>
  );
};

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SelectWrapper = styled.div`
  width: 135px;
  margin: 20px;
`;
