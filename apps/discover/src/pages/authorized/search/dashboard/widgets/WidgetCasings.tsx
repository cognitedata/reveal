import * as React from 'react';

import { useAllCasingsQuery } from 'modules/wellSearch/hooks/useAllCasingsQuery';

import { WidgetLoader } from '../WidgetLoader';

export const WidgetCasings: React.FC = () => {
  return <WidgetLoader title="Casings" query={useAllCasingsQuery} />;
};
