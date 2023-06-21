import React from 'react';
import { AutoMLTableDataType } from 'src/modules/AutoML/Components/AutoMLModelList';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { dateformat } from 'src/utils/DateUtils';

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
