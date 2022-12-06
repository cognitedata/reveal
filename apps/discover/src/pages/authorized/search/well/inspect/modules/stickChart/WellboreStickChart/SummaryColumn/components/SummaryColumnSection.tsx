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
  onToggleExpand?: (isExpanded: boolean) => void;
}

export const SummaryColumnSection: React.FC<
  React.PropsWithChildren<SummaryColumnSectionProps>
> = ({
  name,
  isExpanded: isExpandedProp = false,
  onToggleExpand,
  children,
}) => {
  const [isExpanded, setExpanded] = useState(isExpandedProp);

  useEffect(() => {
    setExpanded(isExpandedProp);
  }, [isExpandedProp]);

  useEffect(() => {
    onToggleExpand?.(isExpanded);
  }, [isExpanded]);

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
