import React from 'react';

import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { AutoMLTableDataType } from '../AutoMLModelList';
import { AutoMLStatusBadge } from '../AutoMLStatusBadge';

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
