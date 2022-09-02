import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepCallback } from 'hooks/useDeep';
import { FullWidth } from 'styles/layout';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnMainHeader,
  EmptyStateWrapper,
} from '../../../common/Events/elements';
import { ColumnOptionsSelector } from '../../components/ColumnOptionsSelector';
import { DepthScaleLines } from '../../components/DepthScaleLines';
import { ColumnVisibilityProps, CasingAssemblyView } from '../../types';
import { EMPTY_SCHEMA_TEXT, LOADING_TEXT } from '../constants';
import { ColumnHeaderWrapper } from '../elements';

import DepthColumn from './components/DepthColumn';
import { DepthIndicators } from './components/DepthIndicators';
import { Legend } from './components/Legend';
import { TopContent } from './components/TopContent';
import { CasingsColumnContentWrapper } from './elements';

export const DEPTH_MEASUREMENT_TYPES = [
  DepthMeasurementUnit.MD,
  DepthMeasurementUnit.TVD,
];

export interface CasingsColumnProps extends ColumnVisibilityProps {
  data?: CasingAssemblyView[];
  isLoading: boolean;
  scaleBlocks: number[];
  rkbLevel: WellboreInternal['datum'];
  wellWaterDepth: WellboreInternal['wellWaterDepth'];
  depthMeasurementType: DepthMeasurementUnit;
  onChangeDepthMeasurementType: (
    depthMeasurementType: DepthMeasurementUnit
  ) => void;
  showBothSides?: boolean;
}

export const CasingsColumn: React.FC<WithDragHandleProps<CasingsColumnProps>> =
  React.memo(
    ({
      data,
      isLoading,
      rkbLevel,
      wellWaterDepth,
      scaleBlocks,
      showBothSides = false,
      depthMeasurementType,
      onChangeDepthMeasurementType,
      isVisible = true,
      ...dragHandleProps
    }) => {
      const renderCasingsColumnContent = useDeepCallback(() => {
        if (isLoading || !data || isEmpty(data)) {
          return (
            <EmptyStateWrapper>
              <EmptyState
                isLoading={isLoading}
                loadingSubtitle={isLoading ? LOADING_TEXT : ''}
                emptySubtitle={EMPTY_SCHEMA_TEXT}
                hideHeading
              />
            </EmptyStateWrapper>
          );
        }

        return (
          <>
            <DepthColumn scaleBlocks={scaleBlocks} />

            <FullWidth>
              <BodyColumnBody>
                <DepthScaleLines scaleBlocks={scaleBlocks} />

                <TopContent
                  rkbLevel={rkbLevel}
                  waterDepth={wellWaterDepth}
                  scaleBlocks={scaleBlocks}
                />

                <DepthIndicators
                  casingAssemblies={data}
                  scaleBlocks={scaleBlocks}
                  showBothSides={showBothSides}
                  depthMeasurementType={depthMeasurementType}
                />
              </BodyColumnBody>
            </FullWidth>
          </>
        );
      }, [data, isLoading, scaleBlocks, depthMeasurementType]);

      return (
        <NoUnmountShowHide show={isVisible}>
          <BodyColumn data-testid="casings-column">
            <ColumnDragger {...dragHandleProps} />

            <ColumnHeaderWrapper>
              <ColumnOptionsSelector
                options={DEPTH_MEASUREMENT_TYPES}
                selectedOption={depthMeasurementType}
                width={24}
                onChange={onChangeDepthMeasurementType}
              />
              <BodyColumnMainHeader>Schema</BodyColumnMainHeader>
              <Legend />
            </ColumnHeaderWrapper>

            <CasingsColumnContentWrapper>
              {renderCasingsColumnContent()}
            </CasingsColumnContentWrapper>
          </BodyColumn>
        </NoUnmountShowHide>
      );
    }
  );
