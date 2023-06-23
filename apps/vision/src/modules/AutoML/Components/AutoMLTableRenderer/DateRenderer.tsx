import React from 'react';

import styled from 'styled-components';

import { AutoMLTableDataType } from '@vision/modules/AutoML/Components/AutoMLModelList';
import { dateformat } from '@vision/utils/DateUtils';

import { Icon } from '@cognite/cogs.js';

export const DateRenderer = ({
  rowData: { createdTime },
}: {
  rowData: AutoMLTableDataType;
}) => {
  return createdTime ? (
    <>{dateformat(new Date(createdTime))}</>
  ) : (
    <StyledIcon type="Loader" />
  );
};

const StyledIcon = styled(Icon)`
  display: flex;
  justify-self: center;
  align-content: center;
`;
