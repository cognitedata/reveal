import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useDeepCallback } from 'hooks/useDeep';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { ColumnVisibilityProps, CasingAssemblyView } from '../../types';

import { CasingAssemblySummary } from './components/CasingAssemblySummary';
import { SummaryColumnEmptyState } from './components/SummaryColumnEmptyState';
import { SummariesWrapper, SummaryColumnWrapper } from './elements';

export interface SummaryColumnProps extends ColumnVisibilityProps {
  data?: CasingAssemblyView[];
  isLoading: boolean;
  summaryVisibility?: BooleanMap;
}

export const SummaryColumn: React.FC<WithDragHandleProps<SummaryColumnProps>> =
  React.memo(
    ({
      data,
      isLoading,
      isVisible = true,
      summaryVisibility,
      ...dragHandleProps
    }) => {
      const renderColumnContent = useDeepCallback(() => {
        if (!data || isEmpty(data)) {
          return <SummaryColumnEmptyState isLoading={isLoading} />;
        }

        return (
          <SummariesWrapper>
            {data.map((casingAssembly) => {
              return (
                <CasingAssemblySummary
                  key={`casing-assembly-summary-${casingAssembly.measuredDepthBase.value}`}
                  casingAssembly={casingAssembly}
                  summaryVisibility={summaryVisibility}
                />
              );
            })}
          </SummariesWrapper>
        );
      }, [data, isLoading, summaryVisibility]);

      return (
        <NoUnmountShowHide show={isVisible}>
          <SummaryColumnWrapper data-testid="summary-column">
            <ColumnDragger {...dragHandleProps} />
            {renderColumnContent()}
          </SummaryColumnWrapper>
        </NoUnmountShowHide>
      );
    }
  );
