import { Tooltip, Icon, AllIconTypes, Colors } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { abbreviateNumber } from 'utils/utils';

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
    pending ? Colors['midblue-8'].hex() : 'white'};
  border: 1px solid
    ${({ pending }) =>
      pending ? Colors['midblue-6'].hex() : Colors['greyscale-grey5'].hex()};
  color: ${({ pending }) =>
    pending ? Colors['midblue-2'].hex() : Colors['greyscale-grey9'].hex()};
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
