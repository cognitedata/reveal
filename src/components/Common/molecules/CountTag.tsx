import { Tooltip, Icon, AllIconTypes, Colors } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { abbreviateNumber } from 'utils/utils';

type CountTagProps = {
  value: number;
  type: 'assets' | 'files';
  draft: boolean;
  tooltipContent?: React.ReactNode;
};

const iconForType = {
  assets: 'ResourceAssets',
  files: 'ResourceDocuments',
};
export const CountTag = ({
  value,
  draft,
  type,
  tooltipContent,
}: CountTagProps) => {
  const Tag = () => (
    <StyledTag draft={draft}>
      <Icon type={iconForType[type] as AllIconTypes} />{' '}
      {abbreviateNumber(value)}
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

const StyledTag = styled.span<{ draft: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  width: 63px;
  height: 28px;
  background: ${({ draft }) => (draft ? Colors['midblue-8'].hex() : 'white')};
  border: 1px solid
    ${({ draft }) =>
      draft ? Colors['midblue-6'].hex() : Colors['greyscale-grey5'].hex()};
  color: ${({ draft }) =>
    draft ? Colors['midblue-2'].hex() : Colors['greyscale-grey9'].hex()};
  box-sizing: border-box;
  border-radius: 4px;
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 0px 6px;
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  user-select: none;
`;
