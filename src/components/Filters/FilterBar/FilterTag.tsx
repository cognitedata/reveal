import React from 'react';
import styled from 'styled-components';
import { Tag, Body, Tooltip } from '@cognite/cogs.js';
import { truncateString } from 'modules/contextualization/utils';

type FilterProps = {
  id: string | number;
  onClose: () => void;
  content: string;
};

export const FilterTag = ({ onClose, id, content }: FilterProps) => {
  return (
    <Tooltip content={content}>
      <StyledTag key={id} closable onClose={onClose} color="#EDF0FF">
        <Body
          style={{
            color: '#4255BB',
            fontSize: '12px',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {truncateString(content, 20)}
        </Body>
      </StyledTag>
    </Tooltip>
  );
};

const StyledTag = styled(Tag)`
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
  min-width: 129px;
  height: 28px;
  overflow: hidden;
  margin: 0 6px 6px 0;
  .cogs-tag {
    background-color: rgba(74, 103, 251, 0.1);
    color: #4255bb;
  }
  .cogs-icon {
    color: #4255bb;
  }
`;
