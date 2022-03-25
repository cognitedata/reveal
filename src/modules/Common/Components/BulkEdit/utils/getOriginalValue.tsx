import React from 'react';
import { CellContainer } from 'src/modules/Common/Components/BulkEdit/Source/getDataForSource';

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
