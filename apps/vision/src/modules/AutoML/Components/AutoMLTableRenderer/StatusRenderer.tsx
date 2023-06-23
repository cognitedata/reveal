import React from 'react';

import styled from 'styled-components';

import { AutoMLTableDataType } from '@vision/modules/AutoML/Components/AutoMLModelList';
import { AutoMLStatusBadge } from '@vision/modules/AutoML/Components/AutoMLStatusBadge';

import { Icon } from '@cognite/cogs.js';

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
