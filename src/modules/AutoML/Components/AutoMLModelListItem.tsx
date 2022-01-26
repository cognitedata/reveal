import React from 'react';
import { Col, Row, Icon, Micro, Colors } from '@cognite/cogs.js';

import styled from 'styled-components';
import { AutoMLModel } from 'src/api/autoML/types';
import { CopyableText } from 'src/modules/FileDetails/Components/FileMetadata/CopyableText';
import { AutoMLModelNameBadge } from './AutoMLModelNameBadge';
import { AutoMLStatusBadge } from './AutoMLStatusBadge';

export const AutoMLModelListItem = (props: {
  model: AutoMLModel;
  selectedModelId?: number;
  onRowClick: (id: number) => void;
}) => {
  const { jobId, name, status } = props.model;

  const handleOnClick = () => {
    props.onRowClick(jobId);
  };

  const selected = props.selectedModelId === jobId;

  return (
    <StyledRow
      cols={8}
      onClick={handleOnClick}
      data-testid="automl-list-item"
      className={`model-table-row ${selected ? 'active' : ''}`}
    >
      <StyledCol span={2}>
        <AutoMLModelNameBadge name={name} small />
      </StyledCol>

      <StyledCol span={2}>
        <CopyableText copyable text={jobId} copyIconColor="#595959">
          <Micro strong>{jobId}</Micro>
        </CopyableText>
      </StyledCol>

      <StyledCol span={1}> </StyledCol>
      <StyledCol span={2}>
        <AutoMLStatusBadge status={status} />
      </StyledCol>
      <StyledCol span={1}>
        <Icon
          type="ChevronRightCompact"
          style={{
            alignContent: 'center',
            color: selected ? Colors['midblue-3'].hex() : 'white',
          }}
        />
      </StyledCol>
    </StyledRow>
  );
};

const StyledRow = styled(Row)`
  display: flex;
  padding: 16px;
  justify-items: flex-start;
  align-items: center;

  width: 100%;
  cursor: pointer;
  border-radius: 5px;

  &.active {
    background: #f1f3ff;

    /* text & icons misc/accent */
    border: 1px solid ${Colors['midblue-3'].hex()};
    box-sizing: border-box;
    border-radius: 6px;
  }
`;

const StyledCol = styled(Col)`
  display: flex;
  align-items: center;
  flex-grow: 1;
`;
