import React from 'react';
import { AutoMLModelNameBadge } from 'src/modules/AutoML/Components/AutoMLModelNameBadge';
import { AutoMLTableDataType } from 'src/modules/AutoML/Components/AutoMLModelList';

export const NameRenderer = ({
  rowData: { name },
}: {
  rowData: AutoMLTableDataType;
}) => {
  return <AutoMLModelNameBadge name={name} small />;
};
