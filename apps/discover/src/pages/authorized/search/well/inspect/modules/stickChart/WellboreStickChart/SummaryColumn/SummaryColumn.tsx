import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useDeepCallback } from 'hooks/useDeep';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { ColumnVisibilityProps, CasingAssemblyView } from '../../types';
import { EMPTY_SUMMARY_TEXT, LOADING_TEXT } from '../constants';

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

export interface SummaryColumnProps extends ColumnVisibilityProps {
  data?: CasingAssemblyView[];
  isLoading: boolean;
}

export const SummaryColumn: React.FC<WithDragHandleProps<SummaryColumnProps>> =
  React.memo(({ data, isLoading, isVisible = true, ...dragHandleProps }) => {
    const renderColumnContent = useDeepCallback(() => {
      if (!data || isEmpty(data)) {
        return (
          <EmptyState
            isLoading={isLoading}
            loadingSubtitle={isLoading ? LOADING_TEXT : ''}
            emptySubtitle={EMPTY_SUMMARY_TEXT}
            hideHeading
          />
        );
      }

      return (
        <SummariesWrapper>
          {data.map((casingAssembly, index) => {
            const { maxOutsideDiameter, measuredDepthBase } = casingAssembly;
            const key = index;

            return (
              <SummaryContainer key={key}>
                <SummarySectionColumn>
                  <CasingSpecification
                    casingDiameter={maxOutsideDiameter.value}
                  />
                  <HoleDepth measuredDepthBase={measuredDepthBase} />
                  <DrillingParameters />
                </SummarySectionColumn>

                <SummarySectionColumn>
                  <MudwayWindow />
                  <HighlightEvent />
                </SummarySectionColumn>
              </SummaryContainer>
            );
          })}
        </SummariesWrapper>
      );
    }, [data, isLoading]);

    return (
      <NoUnmountShowHide show={isVisible}>
        <SummaryColumnWrapper data-testid="summary-column">
          <ColumnDragger {...dragHandleProps} />
          {renderColumnContent()}
        </SummaryColumnWrapper>
      </NoUnmountShowHide>
    );
  });
