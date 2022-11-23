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

export const SummaryColumnSectionEmptyState: React.FC<
  SummaryColumnSectionProps
> = ({ name, isExpanded: isExpandedProp = false }) => {
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
          <EmptyStateText>{NO_DATA_TEXT}</EmptyStateText>
        </SummarySectionContent>
      </SummaryColumnSectionContentWrapper>
    </SummaryColumnSectionWrapper>
  );
};
