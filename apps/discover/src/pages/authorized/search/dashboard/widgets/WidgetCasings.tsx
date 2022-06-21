import { useCasingSchematicsQuery } from 'domain/wells/casings/internal/queries/useCasingSchematicsQuery';

import * as React from 'react';

import { WidgetLoader } from '../WidgetLoader';

export const WidgetCasings: React.FC = () => {
  return <WidgetLoader title="Casings" query={useCasingSchematicsQuery} />;
};
