import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React from 'react';

import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepCallback } from 'hooks/useDeep';
import { FullWidth } from 'styles/layout';

import {
  BodyColumnBody,
  BodyColumnMainHeader,
  EmptyStateWrapper,
} from '../../../common/Events/elements';
import { Column } from '../../components/Column';
import { ColumnOptionsSelector } from '../../components/ColumnOptionsSelector';
import { DepthScaleLines } from '../../components/DepthScaleLines';
import { DetailPageOption } from '../../components/DetailPageOption';
import {
  ColumnVisibilityProps,
  CasingAssemblyView,
  ChartColumn,
} from '../../types';
import { EMPTY_SCHEMA_TEXT, LOADING_TEXT } from '../constants';
import { ColumnHeaderWrapper } from '../elements';

import DepthColumn from './components/DepthColumn';
import { DepthIndicators } from './components/DepthIndicators';
import { Legend } from './components/Legend';
import { TopContent } from './components/TopContent';
import { CasingsColumnContentWrapper } from './elements';

export interface CasingsColumnProps extends ColumnVisibilityProps {
  data?: CasingAssemblyView[];
  isLoading: boolean;
  scaleBlocks: number[];
  rkbLevel: WellboreInternal['datum'];
  wellWaterDepth: WellboreInternal['wellWaterDepth'];
  depthMeasurementType: DepthMeasurementUnit;
  showBothSides?: boolean;
  onClickDetailsButton?: () => void;
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
      onClickDetailsButton = noop,
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
        <Column
          data-testid="casings-column"
          isVisible={isVisible}
          {...dragHandleProps}
        >
          <ColumnHeaderWrapper>
            <ColumnOptionsSelector
              displayValue={ChartColumn.CASINGS}
              Footer={<DetailPageOption onClick={onClickDetailsButton} />}
              disabled={isEmpty(data)}
            />
            <BodyColumnMainHeader>Schema</BodyColumnMainHeader>
            <Legend />
          </ColumnHeaderWrapper>

          <CasingsColumnContentWrapper>
            {renderCasingsColumnContent()}
          </CasingsColumnContentWrapper>
        </Column>
      );
    }
  );
