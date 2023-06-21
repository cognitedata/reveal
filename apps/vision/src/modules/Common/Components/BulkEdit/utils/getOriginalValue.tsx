import React from 'react';
import { CellContainer } from 'src/modules/Common/Components/BulkEdit/utils/CellContainer';

export const getOriginalValue = ({
  originalValue,
}: {
  originalValue: string | undefined;
}): JSX.Element => {
  if (originalValue) {
    return <CellContainer>{originalValue}</CellContainer>;
  }
  return <CellContainer>---</CellContainer>;
};
