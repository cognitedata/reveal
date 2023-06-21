import React from 'react';

import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

/**
 * Annimated Expand/Collapse icon component
 * @param isActive
 * @constructor
 */
export const ExpandIconComponent = ({ isActive }: { isActive: boolean }) => {
  return (
    <IconContainer
      style={{
        transition: 'transform .2s',
        transform: `rotate(${isActive ? 0 : -180}deg)`,
      }}
    >
      <Icon type="ChevronDownSmall" />
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
