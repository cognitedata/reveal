import React from 'react';

import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { dateformat } from '../../../../utils/DateUtils';
import { AutoMLTableDataType } from '../AutoMLModelList';

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
