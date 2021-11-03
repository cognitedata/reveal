import { Tag as CogsTag } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export type TagColor = 'error' | 'warning' | 'primary';
export type TagColorTypes = {
  color: string;
  background: string;
  border: string;
};

const CustomTag = styled(CogsTag)<{
  $colors: TagColorTypes;
}>`
  height: 1.75rem;
  border-radius: 0.25rem;
  background-color: ${({ $colors }) => $colors.background} !important;
  border: 1px solid ${({ $colors }) => $colors.border} !important;
  color: ${({ $colors }) => $colors.color} !important;
  font-size: 14px;

  & > .cogs-icon {
    margin-right: 0px !important;
  }
`;

export const Tag: React.FC<{ color?: TagColor }> = ({
  children,
  color = 'primary',
}) => {
  const colorMapper: {
    [x in typeof color]: TagColorTypes;
  } = {
    warning: {
      color: '#B25C00',
      background: '#FFFBF2',
      border: '#E08506',
    },
    error: {
      color: '#AF1613',
      background: 'transparent',
      border: 'grey',
    },
    primary: {
      color: '#4255BB',
      background: '##F6F7FF',
      border: '#DBE1FE',
    },
  };

  return (
    <CustomTag $colors={colorMapper[color]} icon="Document">
      {children}
    </CustomTag>
  );
};
