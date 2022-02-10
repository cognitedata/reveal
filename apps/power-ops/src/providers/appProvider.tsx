import * as React from 'react';

import { ProvideMixpanelSetup } from './mixPanelProvider';

export const Providers: React.FC = ({ children }) => {
  return <ProvideMixpanelSetup>{children}</ProvideMixpanelSetup>;
};
