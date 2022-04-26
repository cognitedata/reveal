import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import React from 'react';

/**
 * Annimated Expand/Collapse icon component
 * @param isActive
 * @constructor
 */
export const ExpandIconComponent = ({ isActive }: { isActive: boolean }) => {
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
