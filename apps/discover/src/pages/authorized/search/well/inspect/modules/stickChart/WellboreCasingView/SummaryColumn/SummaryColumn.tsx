import React from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { CasingAssemblyView } from '../../types';

import {
  SummariesWrapper,
  SummaryColumnWrapper,
  SummaryContainer,
  SummarySectionColumn,
} from './elements';
import { CasingSpecification } from './sections/CasingSpecification';
import { DrillingParameters } from './sections/DrillingParameters';
import { HighlightEvent } from './sections/HighlightEvent';
import { HoleDepth } from './sections/HoleDepth';
import { MudwayWindow } from './sections/MudwayWindow';

export interface SummaryColumnProps {
  casingAssemblies: CasingAssemblyView[];
}

export const SummaryColumn: React.FC<
  WithDragHandleProps<SummaryColumnProps>
> = ({ casingAssemblies, ...dragHandleProps }) => {
  return (
    <SummaryColumnWrapper data-testid="summary-column">
      <ColumnDragger {...dragHandleProps} />

      <SummariesWrapper>
        {casingAssemblies.map((casingAssembly, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <SummaryContainer key={index}>
            <SummarySectionColumn>
              <CasingSpecification
                casingDiameter={casingAssembly.maxOutsideDiameter.value}
              />
              <HoleDepth measuredDepthBase={casingAssembly.measuredDepthBase} />
              <DrillingParameters />
            </SummarySectionColumn>

            <SummarySectionColumn>
              <MudwayWindow />
              <HighlightEvent />
            </SummarySectionColumn>
          </SummaryContainer>
        ))}
      </SummariesWrapper>
    </SummaryColumnWrapper>
  );
};
