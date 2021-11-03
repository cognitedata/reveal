import { Tag as CogsTag } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

const CustomTag = styled(CogsTag)`
  height: 1.75rem;
  border-radius: 0.25rem;
  background-color: #f6f7ff !important;
  border: 1px solid #dbe1fe !important;
  color: #4255bb !important;
  font-size: 14px;

  & > .cogs-icon {
    margin-right: 0px !important;
  }
`;

export const Tag: React.FC = ({ children }) => {
  return <CustomTag icon="Document">{children}</CustomTag>;
};
