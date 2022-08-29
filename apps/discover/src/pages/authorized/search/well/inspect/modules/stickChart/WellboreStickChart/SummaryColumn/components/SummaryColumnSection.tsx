import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  SummaryColumnSectionContentWrapper,
  SummaryColumnSectionWrapper,
} from '../elements';

import { SummarySectionToggle } from './SummarySectionToggle';

export interface SummaryColumnSectionProps {
  name: string;
  isExpanded?: boolean;
}

export const SummaryColumnSection: React.FC<
  React.PropsWithChildren<SummaryColumnSectionProps>
> = ({ name, isExpanded: isExpandedProp = false, children }) => {
  const [isExpanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(isExpandedProp);
  }, [isExpandedProp]);

  return (
    <SummaryColumnSectionWrapper>
      <SummarySectionToggle
        name={name}
        isExpanded={isExpanded}
        onToggleExpand={() => setExpanded((isExpanded) => !isExpanded)}
      />

      <SummaryColumnSectionContentWrapper $visible={isExpanded}>
        {children}
      </SummaryColumnSectionContentWrapper>
    </SummaryColumnSectionWrapper>
  );
};
