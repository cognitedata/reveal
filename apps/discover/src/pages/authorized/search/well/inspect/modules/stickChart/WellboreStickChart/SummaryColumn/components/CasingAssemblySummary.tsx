import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';

import {
  CasingAssemblyView,
  HoleSectionView,
  SummarySection,
} from '../../../types';
import { SummaryContainer, SummarySectionColumn } from '../elements';

import { CasingSpecification } from './sections/CasingSpecification';
// import { DrillingParameters } from './sections/DrillingParameters';
// import { HighlightEvent } from './sections/HighlightEvent';
import { HoleSectionSummary } from './sections/HoleSectionSummary';
import { MudWeightWindow } from './sections/MudWeightWindow';

export interface CasingAssemblySummaryProps {
  casingAssembly: CasingAssemblyView;
  holeSections: HoleSectionView[];
  measurementsData: DepthMeasurementWithData[];
  depthMeasurementType?: DepthMeasurementUnit;
  summaryVisibility?: BooleanMap;
}

export const CasingAssemblySummary: React.FC<CasingAssemblySummaryProps> = ({
  casingAssembly,
  holeSections,
  measurementsData,
  depthMeasurementType,
  summaryVisibility = EMPTY_OBJECT as BooleanMap,
}) => {
  return (
    <SummaryContainer>
      <SummarySectionColumn width={200}>
        <CasingSpecification
          casingAssembly={casingAssembly}
          isExpanded={summaryVisibility[SummarySection.CasingSpecification]}
        />
        <HoleSectionSummary
          holeSections={holeSections}
          depthMeasurementType={depthMeasurementType}
          isExpanded={summaryVisibility[SummarySection.HoleSection]}
        />
        {/* <DrillingParameters
          isExpanded={summaryVisibility[SummarySection.DrillingParameters]}
        /> */}
      </SummarySectionColumn>

      <SummarySectionColumn>
        <MudWeightWindow
          measurementsData={measurementsData}
          depthMeasurementType={depthMeasurementType}
          isExpanded={summaryVisibility[SummarySection.MudWeightWindow]}
        />
        {/* <HighlightEvent
          isExpanded={summaryVisibility[SummarySection.HighlightedEvent]}
        /> */}
      </SummarySectionColumn>
    </SummaryContainer>
  );
};
