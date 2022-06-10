import { useAllNptCursorsQuery } from 'domain/wells/npt/internal/queries/useAllNptCursorsQuery';

import * as React from 'react';

import { WidgetLoader } from '../WidgetLoader';

export const WidgetNPT: React.FC = () => {
  return <WidgetLoader title="NPT" query={useAllNptCursorsQuery} />;
};
