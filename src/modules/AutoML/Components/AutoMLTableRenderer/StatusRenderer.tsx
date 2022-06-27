import React from 'react';
import { AutoMLStatusBadge } from 'src/modules/AutoML/Components/AutoMLStatusBadge';
import { AutoMLTableDataType } from 'src/modules/AutoML/Components/AutoMLModelList';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StatusRenderer = ({
  rowData: { status, errorMessage },
}: {
  rowData: AutoMLTableDataType;
}) => {
  return status ? (
    <AutoMLStatusBadge status={status} errorMessage={errorMessage} />
  ) : (
    <StyledIcon type="Loader" />
  );
};

const StyledIcon = styled(Icon)`
  display: flex;
  justify-self: center;
  align-content: center;
`;
