import styled from 'styled-components';
import { CollapsePanelProps, Icon } from '@cognite/cogs.js';
import React from 'react';

export const ExpandIconComponent = ({ isActive }: CollapsePanelProps) => {
  return (
    <IconContainer>
      <Icon
        type="ChevronDownCompact"
        style={{
          transition: 'transform .2s',
          transform: `rotate(${isActive ? 0 : -180}deg)`,
        }}
      />
    </IconContainer>
  );
};

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 22px;
  margin-right: 8px;
  border-radius: 4px;
`;
