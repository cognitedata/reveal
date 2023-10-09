import React from 'react';

import { AutoMLTableDataType } from '../AutoMLModelList';
import { AutoMLModelNameBadge } from '../AutoMLModelNameBadge';

export const NameRenderer = ({
  rowData: { name },
}: {
  rowData: AutoMLTableDataType;
}) => {
  return <AutoMLModelNameBadge name={name} small />;
};
