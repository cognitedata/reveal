import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React from 'react';

import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';
import { DepthMeasurementUnit } from 'constants/units';
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
  HoleSectionView,
} from '../../types';
import { LOADING_TEXT, NO_DATA_TEXT } from '../constants';
import { ColumnHeaderWrapper } from '../elements';
import { HoleSectionsColumn } from '../HoleSectionsColumn';

import DepthColumn from './components/DepthColumn';
import { DepthIndicators } from './components/DepthIndicators';
import { Legend } from './components/Legend';
import { TopContent } from './components/TopContent';
import { CasingsColumnContentWrapper } from './elements';

export interface CasingsColumnProps extends ColumnVisibilityProps {
  data?: CasingAssemblyView[];
  isLoading: boolean;
  holeSections?: HoleSectionView[];
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
      holeSections,
      rkbLevel,
      wellWaterDepth,
      scaleBlocks,
      showBothSides = false,
      depthMeasurementType,
      onClickDetailsButton = noop,
      isVisible = true,
      ...dragHandleProps
    }) => {
      const renderCasingsColumnContent = () => {
        if (isLoading || !data || isEmpty(data)) {
          return (
            <EmptyStateWrapper>
              <EmptyState
                isLoading={isLoading}
                loadingSubtitle={isLoading ? LOADING_TEXT : ''}
                emptySubtitle={NO_DATA_TEXT}
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

                <HoleSectionsColumn
                  data={holeSections}
                  scaleBlocks={scaleBlocks}
                  depthMeasurementType={depthMeasurementType}
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
      };

      return (
        <Column id="casings-column" isVisible={isVisible} {...dragHandleProps}>
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
