import React from 'react';

import { useCellSelection } from '@raw-explorer/hooks/table-selection';

import { Icon } from '@cognite/cogs.js';

import { StyledExpandButton } from './Cell.styles';

export const ExpandButton = (): JSX.Element => {
  const { setIsCellExpanded } = useCellSelection();

  const onExpandClick = (event: any) => {
    event.stopPropagation();
    setIsCellExpanded(true);
  };

  return (
    <StyledExpandButton
      type="primary"
      size="small"
      onClick={onExpandClick}
      style={{ padding: '4px' }}
    >
      <Icon type="Expand" />
    </StyledExpandButton>
  );
};
