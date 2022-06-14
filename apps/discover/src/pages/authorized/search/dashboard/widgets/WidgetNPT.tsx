import { useNptEventsQuery } from 'domain/wells/npt/internal/queries/useNptEventsQuery';

import * as React from 'react';

import { WidgetLoader } from '../WidgetLoader';

export const WidgetNPT: React.FC = () => {
  return <WidgetLoader title="NPT" query={useNptEventsQuery} />;
};
