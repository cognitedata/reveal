import { Tooltip, Icon, AllIconTypes } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { abbreviateNumber } from 'utils/utils';

type CountTagProps = {
  value: number;
  type: 'assets' | 'files';
  draft: boolean;
  tooltipContent: React.ReactNode;
};

const iconForType = {
  assets: 'ResourceAssets',
  files: 'ResourceDocuments',
};
const CountTag = ({ value, draft, type, tooltipContent }: CountTagProps) => {
  return (
    <Tooltip content={tooltipContent}>
      <StyledTag draft={draft}>
        {' '}
        <Icon type={iconForType[type] as AllIconTypes} />{' '}
        {abbreviateNumber(value)}
      </StyledTag>
    </Tooltip>
  );
};

export default CountTag;

const StyledTag = styled.span<{ draft: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  width: 63px;
  height: 28px;
  background: ${({ draft }) => (draft ? '#F6F7FF' : 'white')};
  border: 1px solid ${({ draft }) => (draft ? '#DBE1FE' : '#BFBFBF')};
  color: ${({ draft }) => (draft ? '#4255BB' : '#333333')};
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
`;
