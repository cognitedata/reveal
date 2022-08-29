import * as React from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { EMPTY_OBJECT } from 'constants/empty';

import { CasingAssemblyView, SummarySection } from '../../../types';
import { SummaryContainer, SummarySectionColumn } from '../elements';

import { CasingSpecification } from './sections/CasingSpecification';
import { DrillingParameters } from './sections/DrillingParameters';
import { HighlightEvent } from './sections/HighlightEvent';
import { HoleDepth } from './sections/HoleDepth';
import { MudwayWindow } from './sections/MudwayWindow';

export interface CasingAssemblySummaryProps {
  casingAssembly: CasingAssemblyView;
  summaryVisibility?: BooleanMap;
}

export const CasingAssemblySummary: React.FC<CasingAssemblySummaryProps> = ({
  casingAssembly,
  summaryVisibility = EMPTY_OBJECT as BooleanMap,
}) => {
  const { maxOutsideDiameter, measuredDepthBase } = casingAssembly;

  return (
    <SummaryContainer>
      <SummarySectionColumn>
        <CasingSpecification
          casingDiameter={maxOutsideDiameter.value}
          isExpanded={summaryVisibility[SummarySection.CasingSpecification]}
        />
        <HoleDepth
          measuredDepthBase={measuredDepthBase}
          isExpanded={summaryVisibility[SummarySection.HoleDepth]}
        />
        <DrillingParameters
          isExpanded={summaryVisibility[SummarySection.DrillingParameters]}
        />
      </SummarySectionColumn>

      <SummarySectionColumn>
        <MudwayWindow
          isExpanded={summaryVisibility[SummarySection.MudwayWindow]}
        />
        <HighlightEvent
          isExpanded={summaryVisibility[SummarySection.HighlightedEvent]}
        />
      </SummarySectionColumn>
    </SummaryContainer>
  );
};
