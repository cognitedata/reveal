import React from 'react';
import { Icon } from '@cognite/cogs.js';

import { useTableSelection } from 'hooks/table-selection';
import { StyledExpandButton } from './Cell.styles';

export const ExpandButton = (): JSX.Element => {
  const { setIsCellExpanded } = useTableSelection();

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
