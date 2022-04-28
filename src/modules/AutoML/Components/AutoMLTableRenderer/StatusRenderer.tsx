import React from 'react';
import { AutoMLStatusBadge } from 'src/modules/AutoML/Components/AutoMLStatusBadge';
import { AutoMLTableDataType } from 'src/modules/AutoML/Components/AutoMLModelList';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StatusRenderer = ({
  rowData: { status },
}: {
  rowData: AutoMLTableDataType;
}) => {
  return status ? (
    <AutoMLStatusBadge status={status} />
  ) : (
    <StyledIcon type="Loading" />
  );
};

const StyledIcon = styled(Icon)`
  display: flex;
  justify-self: center;
  align-content: center;
`;
