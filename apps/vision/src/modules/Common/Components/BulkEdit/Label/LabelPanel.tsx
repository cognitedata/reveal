import React from 'react';

import styled from 'styled-components';

import { Body } from '@cognite/cogs.js';
import { LabelFilter } from '@cognite/data-exploration';

import { EditPanelProps } from '../bulkEditOptions';

export const LabelPanel = ({
  bulkEditUnsaved,
  setBulkEditUnsaved,
}: EditPanelProps) => (
  <PanelContainer>
    <SelectContainer>
      <Body level={2}>Add from existing labels</Body>
      <LabelFilterContainer>
        <LabelFilter
          resourceType="file"
          value={bulkEditUnsaved.labels}
          setValue={(newFilters) =>
            setBulkEditUnsaved({
              ...bulkEditUnsaved,
              labels: newFilters,
            })
          }
        />
      </LabelFilterContainer>
    </SelectContainer>
  </PanelContainer>
);

const PanelContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: left;
  align-items: end;
  grid-gap: 8px;
`;
const SelectContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  height: 62px;
`;

const LabelFilterContainer = styled.div`
  width: 255px;
  span {
    .title {
      display: none;
    }
  }
`;
