import React from 'react';
import { Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import { LabelFilter } from '@cognite/data-exploration';
import { BulkEditTempState } from 'src/modules/Explorer/store/explorerSlice';

export const LabelPanel = ({
  bulkEditTemp,
  setBulkEditTemp,
}: {
  bulkEditTemp: BulkEditTempState;
  setBulkEditTemp: (value: BulkEditTempState) => void;
}) => (
  <PanelContainer>
    <SelectContainer>
      <Body level={2}>Add from existing labels</Body>
      <LabelFilterContainer>
        <LabelFilter
          resourceType="file"
          value={bulkEditTemp.labels}
          setValue={(newFilters) =>
            setBulkEditTemp({
              ...bulkEditTemp,
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
  width: 630px;
`;

const LabelFilterContainer = styled.div`
  span {
    .title {
      display: none;
    }
  }
`;
