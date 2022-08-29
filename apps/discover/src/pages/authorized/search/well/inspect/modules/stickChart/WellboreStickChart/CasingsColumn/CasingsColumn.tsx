import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY } from 'constants/empty';
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
import { DepthScaleLines } from '../../components/DepthScaleLines';
import { ColumnVisibilityProps, CasingAssemblyView } from '../../types';
import { EMPTY_SCHEMA_TEXT, LOADING_TEXT } from '../constants';
import { ColumnHeaderWrapper } from '../elements';

import DepthColumn from './components/DepthColumn';
import { DepthIndicators } from './components/DepthIndicators';
import { DepthMeasurementTypeSelector } from './components/DepthMeasurementTypeSelector';
import { Legend } from './components/Legend';
import { TopContent } from './components/TopContent';
import { CasingsColumnContentWrapper } from './elements';

export interface CasingsColumnProps extends ColumnVisibilityProps {
  data?: CasingAssemblyView[];
  isLoading: boolean;
  scaleBlocks: number[];
  scaleBlocksTVD?: number[];
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
      scaleBlocksTVD = EMPTY_ARRAY,
      showBothSides = false,
      depthMeasurementType,
      onChangeDepthMeasurementType,
      isVisible = true,
      ...dragHandleProps
    }) => {
      const renderCasingsColumnContent = useDeepCallback(() => {
        if (!data || isEmpty(data) || isLoading) {
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
            <DepthColumn
              scaleBlocks={scaleBlocks}
              scaleBlocksTVD={scaleBlocksTVD}
              depthMeasurementType={depthMeasurementType}
            />

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
              <DepthMeasurementTypeSelector
                selectedDepthMeasurementType={depthMeasurementType}
                onChangeDepthMeasurementType={onChangeDepthMeasurementType}
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
