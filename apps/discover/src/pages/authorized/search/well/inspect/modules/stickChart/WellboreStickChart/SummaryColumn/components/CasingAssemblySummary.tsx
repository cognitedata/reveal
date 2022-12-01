import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

import * as React from 'react';
import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { EMPTY_OBJECT } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import {
  useHighlightedNdsMap,
  useHighlightedNptMap,
} from 'modules/wellInspect/selectors';

import {
  CasingAssemblyView,
  HoleSectionView,
  SummarySection,
} from '../../../types';
import { SummaryContainer, SummarySectionColumn } from '../elements';

import { CasingSpecification } from './sections/CasingSpecification';
// import { DrillingParameters } from './sections/DrillingParameters';
import { HighlightedEvent } from './sections/HighlightedEvent';
import { HoleSectionSummary } from './sections/HoleSectionSummary';
import { MudWeight } from './sections/MudWeight';

export interface CasingAssemblySummaryProps {
  casingAssembly: CasingAssemblyView;
  holeSections: HoleSectionView[];
  mudWeightData: DepthMeasurementWithData[];
  nptEvents: NptInternalWithTvd[];
  ndsEvents: NdsInternalWithTvd[];
  depthMeasurementType?: DepthMeasurementUnit;
  summaryVisibility?: BooleanMap;
}

export const CasingAssemblySummary: React.FC<CasingAssemblySummaryProps> = ({
  casingAssembly,
  holeSections,
  mudWeightData,
  nptEvents,
  ndsEvents,
  depthMeasurementType,
  summaryVisibility = EMPTY_OBJECT as BooleanMap,
}) => {
  const highlightedNptMap = useHighlightedNptMap();
  const highlightedNdsMap = useHighlightedNdsMap();

  const highlightedNptEvents = useMemo(() => {
    return nptEvents.filter(
      ({ source }) => highlightedNptMap[source.eventExternalId]
    );
  }, [nptEvents, highlightedNptMap]);

  const highlightedNdsEvents = useMemo(() => {
    return ndsEvents.filter(
      ({ source }) => highlightedNdsMap[source.eventExternalId]
    );
  }, [ndsEvents, highlightedNdsMap]);

  const noEventHighlighted =
    !isEmpty(nptEvents) &&
    !isEmpty(ndsEvents) &&
    isEmpty(highlightedNptEvents) &&
    isEmpty(highlightedNdsEvents);

  return (
    <SummaryContainer>
      <SummarySectionColumn width={220}>
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
        <MudWeight
          data={mudWeightData}
          depthMeasurementType={depthMeasurementType}
          isExpanded={summaryVisibility[SummarySection.MudWeight]}
        />
        <HighlightedEvent
          nptEvents={highlightedNptEvents}
          ndsEvents={highlightedNdsEvents}
          noEventHighlighted={noEventHighlighted}
          depthMeasurementType={depthMeasurementType}
          isExpanded={summaryVisibility[SummarySection.HighlightedEvent]}
        />
      </SummarySectionColumn>
    </SummaryContainer>
  );
};
