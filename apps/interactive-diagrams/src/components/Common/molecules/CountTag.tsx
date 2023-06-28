import React from 'react';

import styled from 'styled-components';

import { Tooltip, Icon, AllIconTypes, Colors } from '@cognite/cogs.js';

import { abbreviateNumber } from '../../../utils/utils';

type CountTagProps = {
  value: number;
  type: 'assets' | 'files';
  pending: boolean;
  tooltipContent?: React.ReactNode;
};

const iconForType = {
  assets: 'Assets',
  files: 'Document',
};
export const CountTag = ({
  value,
  pending,
  type,
  tooltipContent,
}: CountTagProps) => {
  const Tag = () => (
    <StyledTag pending={pending}>
      <Icon type={iconForType[type] as AllIconTypes} />{' '}
      <span style={{ marginLeft: '6px' }}>{abbreviateNumber(value)}</span>
    </StyledTag>
  );

  if (tooltipContent)
    return (
      <Tooltip content={tooltipContent}>
        <Tag />
      </Tooltip>
    );
  return <Tag />;
};

const StyledTag = styled.span<{ pending: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background: ${({ pending }) =>
    pending ? Colors['decorative--blue--700'] : 'white'};
  border: 1px solid
    ${({ pending }) =>
      pending
        ? Colors['decorative--blue--600']
        : Colors['decorative--grayscale--500']};
  color: ${({ pending }) =>
    pending
      ? Colors['decorative--blue--200']
      : Colors['decorative--grayscale--900']};
  box-sizing: border-box;
  border-radius: 4px;
  flex: none;
  order: 1;
  flex-grow: 0;
  margin-right: 6px;
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  user-select: none;
`;
