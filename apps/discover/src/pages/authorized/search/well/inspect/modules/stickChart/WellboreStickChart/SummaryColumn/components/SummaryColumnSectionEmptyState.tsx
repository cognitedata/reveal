import * as React from 'react';
import { useEffect, useState } from 'react';

import { NO_DATA_TEXT } from '../../constants';
import {
  EmptyStateText,
  SummaryColumnSectionContentWrapper,
  SummaryColumnSectionWrapper,
  SummarySectionContent,
} from '../elements';

import { SummaryColumnSectionProps } from './SummaryColumnSection';
import { SummarySectionToggle } from './SummarySectionToggle';

export interface SummaryColumnSectionEmptyStateProps
  extends SummaryColumnSectionProps {
  emptyText?: string;
}

export const SummaryColumnSectionEmptyState: React.FC<
  SummaryColumnSectionEmptyStateProps
> = ({
  name,
  isExpanded: isExpandedProp = false,
  emptyText = NO_DATA_TEXT,
}) => {
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
        <SummarySectionContent>
          <EmptyStateText>{emptyText}</EmptyStateText>
        </SummarySectionContent>
      </SummaryColumnSectionContentWrapper>
    </SummaryColumnSectionWrapper>
  );
};
