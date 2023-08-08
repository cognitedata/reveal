import React from 'react';

import { Switch } from '@cognite/cogs.js';

interface Props {
  onChange(value: boolean): void;
}

export const ShowLabeledFilesFilter: React.FC<Props> = ({ onChange }) => {
  return (
    <Switch
      label="Show already labeled files"
      name="showLabeledFilesFilter"
      onChange={(_, nextValue) => onChange(!!nextValue)}
    />
  );
};
