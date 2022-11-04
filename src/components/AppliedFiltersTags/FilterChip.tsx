import { Button, Label, Tooltip } from '@cognite/cogs.js';
import { COMMON_FILTER_KEYS } from 'domain/constants';
import includes from 'lodash/includes';
import React from 'react';
import styled from 'styled-components';
import { getTitle } from './utils';

interface Props {
  name: string;
  value: string;
  onClick?: () => void;
}
export const FilterChip: React.FC<Props> = ({ name, value, onClick }) => {
  const variant = includes(COMMON_FILTER_KEYS, name) ? 'normal' : 'success';
  const text = `${getTitle(name)}: ${value}`;

  return (
    <Tooltip content={text}>
      <StyledChip
        variant={variant}
        onClick={onClick}
        selectable={Boolean(onClick)}
        size="medium"
      >
        <Title>{text}</Title>
        {Boolean(onClick) && <CloseButton onClick={onClick} />}
      </StyledChip>
    </Tooltip>
  );
};

const StyledChip = styled(Label)`
  && {
    width: fit-content;
    max-height: 28px;
  }
`;
const CloseButton = styled(Button).attrs({
  icon: 'Close',
  'aria-label': 'Close filter',
  type: 'ghost',
  size: 'small',
})`
  &:hover {
    background: transparent !important;
  }
`;

const Title = styled.div`
  max-width: 300px;
  text-overflow: ellipsis;
  display: block !important;
  white-space: nowrap;
  overflow: hidden;
`;
