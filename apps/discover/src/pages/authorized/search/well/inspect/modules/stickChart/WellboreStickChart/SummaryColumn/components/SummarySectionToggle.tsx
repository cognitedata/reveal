import * as React from 'react';

import { SummarySectionToggleButton } from '../elements';

export interface SummarySectionToggleProps {
  name: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const SummarySectionToggle: React.FC<SummarySectionToggleProps> = ({
  name,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <SummarySectionToggleButton
      toggled
      icon={isExpanded ? 'ChevronUpSmall' : 'ChevronDownSmall'}
      iconPlacement="right"
      onClick={onToggleExpand}
    >
      {name}
    </SummarySectionToggleButton>
  );
};
