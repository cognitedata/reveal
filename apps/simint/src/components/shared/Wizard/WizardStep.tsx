import { TabPane } from 'rc-tabs';
import type { TabPaneProps } from 'rc-tabs';

import type { IconType } from '@cognite/cogs.js';

export interface WizardStepProps extends TabPaneProps {
  title: string;
  icon?: IconType;
  disabled?: boolean;
  validationErrors?: () => number;
}

export function WizardStep({
  disabled,
  children,
  ...additionalProps
}: React.PropsWithChildren<WizardStepProps>) {
  return (
    <TabPane disabled={disabled} {...additionalProps}>
      {children}
    </TabPane>
  );
}
