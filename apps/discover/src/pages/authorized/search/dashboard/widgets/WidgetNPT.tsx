import * as React from 'react';

import { useAllNptCursorsQuery } from 'modules/wellSearch/hooks/useAllNptCursorsQuery';

import { WidgetLoader } from '../WidgetLoader';

export const WidgetNPT: React.FC = () => {
  return <WidgetLoader title="NPT" query={useAllNptCursorsQuery} />;
};
