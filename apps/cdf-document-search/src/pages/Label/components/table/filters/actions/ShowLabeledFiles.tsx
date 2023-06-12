import React from 'react';

import { Switch } from '@cognite/cogs.js';

interface Props {
  onChange(value: boolean): void;
}

export const ShowLabeledFilesFilter: React.FC<Props> = ({ onChange }) => {
  return (
    <Switch name="showLabeledFilesFilter" onChange={onChange}>
      Show already labeled files
    </Switch>
  );
};
