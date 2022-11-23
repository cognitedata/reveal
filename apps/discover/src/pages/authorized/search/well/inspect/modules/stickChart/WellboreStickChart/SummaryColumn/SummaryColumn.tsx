import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';

import { Column } from '../../components/Column';
import { ColumnVisibilityProps, CasingAssemblyView } from '../../types';
import { getMeasurementsDataForCasingAssembly } from '../../utils/getMeasurementsDataForCasingAssembly';

import { CasingAssemblySummary } from './components/CasingAssemblySummary';
import { SummaryColumnEmptyState } from './components/SummaryColumnEmptyState';
import { SummariesWrapper } from './elements';

export interface SummaryColumnProps extends ColumnVisibilityProps {
  casingAssemblies?: CasingAssemblyView[];
  measurementsData?: DepthMeasurementWithData[];
  isLoading?: boolean;
  depthMeasurementType?: DepthMeasurementUnit;
  summaryVisibility?: BooleanMap;
}

export const SummaryColumn: React.FC<WithDragHandleProps<SummaryColumnProps>> =
  React.memo(
    ({
      casingAssemblies,
      measurementsData = EMPTY_ARRAY,
      isLoading = false,
      isVisible = true,
      depthMeasurementType,
      summaryVisibility,
      ...dragHandleProps
    }) => {
      const renderColumnContent = () => {
        if (!casingAssemblies || isEmpty(casingAssemblies)) {
          return <SummaryColumnEmptyState isLoading={isLoading} />;
        }

        return (
          <SummariesWrapper>
            {casingAssemblies.map((casingAssembly) => {
              return (
                <CasingAssemblySummary
                  key={casingAssembly.id}
                  casingAssembly={casingAssembly}
                  measurementsData={getMeasurementsDataForCasingAssembly(
                    measurementsData,
                    casingAssembly
                  )}
                  depthMeasurementType={depthMeasurementType}
                  summaryVisibility={summaryVisibility}
                />
              );
            })}
          </SummariesWrapper>
        );
      };

      return (
        <Column id="summary-column" isVisible={isVisible} {...dragHandleProps}>
          {renderColumnContent()}
        </Column>
      );
    }
  );
