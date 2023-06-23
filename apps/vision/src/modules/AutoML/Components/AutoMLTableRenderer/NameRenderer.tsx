import React from 'react';

import { AutoMLTableDataType } from '@vision/modules/AutoML/Components/AutoMLModelList';
import { AutoMLModelNameBadge } from '@vision/modules/AutoML/Components/AutoMLModelNameBadge';

export const NameRenderer = ({
  rowData: { name },
}: {
  rowData: AutoMLTableDataType;
}) => {
  return <AutoMLModelNameBadge name={name} small />;
};
