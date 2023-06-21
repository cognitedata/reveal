import React from 'react';
import { CellContainer } from 'src/modules/Common/Components/BulkEdit/utils/CellContainer';

export const getUpdatedValue = ({
  originalValue,
  newValue,
}: {
  originalValue: string | undefined;
  newValue: string | undefined;
}): JSX.Element => {
  if (newValue === '') {
    return <CellContainer>---</CellContainer>;
  }
  if (newValue) {
    return <CellContainer>{newValue}</CellContainer>;
  }
  return originalValue ? (
    <CellContainer>{originalValue}</CellContainer>
  ) : (
    <CellContainer>---</CellContainer>
  );
};
