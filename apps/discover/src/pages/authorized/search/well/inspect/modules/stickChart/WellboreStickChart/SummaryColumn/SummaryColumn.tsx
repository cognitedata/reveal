import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';

import { Column } from '../../components/Column';
import {
  ColumnVisibilityProps,
  CasingAssemblyView,
  HoleSectionView,
} from '../../types';
import { getHoleSectionsForCasingAssembly } from '../../utils/getHoleSectionsForCasingAssembly';
import { getMeasurementsDataForCasingAssembly } from '../../utils/getMeasurementsDataForCasingAssembly';
import { getNdsForCasingAssembly } from '../../utils/getNdsForCasingAssembly';
import { getNptForCasingAssembly } from '../../utils/getNptForCasingAssembly';

import { CasingAssemblySummary } from './components/CasingAssemblySummary';
import { SummaryColumnEmptyState } from './components/SummaryColumnEmptyState';
import { SummariesWrapper } from './elements';

export interface SummaryColumnProps extends ColumnVisibilityProps {
  casingAssemblies?: CasingAssemblyView[];
  holeSections?: HoleSectionView[];
  measurementsData?: DepthMeasurementWithData[];
  nptEvents?: NptInternalWithTvd[];
  ndsEvents?: NdsInternalWithTvd[];
  isLoading?: boolean;
  depthMeasurementType?: DepthMeasurementUnit;
  summaryVisibility?: BooleanMap;
}

export const SummaryColumn: React.FC<WithDragHandleProps<SummaryColumnProps>> =
  React.memo(
    ({
      casingAssemblies,
      holeSections = EMPTY_ARRAY,
      measurementsData = EMPTY_ARRAY,
      nptEvents = EMPTY_ARRAY,
      ndsEvents = EMPTY_ARRAY,
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
                  holeSections={getHoleSectionsForCasingAssembly(
                    holeSections,
                    casingAssembly,
                    depthMeasurementType
                  )}
                  measurementsData={getMeasurementsDataForCasingAssembly(
                    measurementsData,
                    casingAssembly,
                    depthMeasurementType
                  )}
                  nptEvents={getNptForCasingAssembly(
                    nptEvents,
                    casingAssembly,
                    depthMeasurementType
                  )}
                  ndsEvents={getNdsForCasingAssembly(
                    ndsEvents,
                    casingAssembly,
                    depthMeasurementType
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
