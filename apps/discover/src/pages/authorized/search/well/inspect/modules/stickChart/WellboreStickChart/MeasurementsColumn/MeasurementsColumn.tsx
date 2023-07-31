import { filterByMeasurementTypeParent } from 'domain/wells/measurements/internal/selectors/filterByMeasurementTypeParent';
import { filterMdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterMdIndexedDepthMeasurements';
import { filterTvdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterTvdIndexedDepthMeasurements';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import React from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { FlexColumn } from 'styles/layout';

import {
  BodyColumnBody,
  BodyColumnMainHeader,
} from '../../../common/Events/elements';
import { Column } from '../../components/Column';
import { ColumnEmptyState } from '../../components/ColumnEmptyState';
import { DepthScaleLines } from '../../components/DepthScaleLines';
import { useScaledDepth } from '../../hooks/useScaledDepth';
import { ChartColumn, ColumnVisibilityProps } from '../../types';
import { adaptMeasurementDataToColumn } from '../../utils/adaptMeasurementDataToColumn';
import {
  DEFAULT_PRESSURE_UNIT,
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
} from '../constants';
import { ColumnHeaderWrapper } from '../elements';

import { PressureDataLabel } from './components/PressureDataLabel';

export interface MeasurementsColumnProps extends ColumnVisibilityProps {
  data?: DepthMeasurementWithData[];
  isLoading?: boolean;
  scaleBlocks: number[];
  measurementTypesSelection?: BooleanMap;
  depthMeasurementType?: DepthMeasurementUnit;
  pressureUnit?: PressureUnit;
}

export const MeasurementsColumn: React.FC<
  WithDragHandleProps<MeasurementsColumnProps>
> = React.memo(
  ({
    data: allData = EMPTY_ARRAY,
    isLoading,
    scaleBlocks,
    measurementTypesSelection,
    depthMeasurementType = DepthMeasurementUnit.TVD,
    pressureUnit = DEFAULT_PRESSURE_UNIT,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

    const getScaledDepth = useScaledDepth(scaleBlocks);

    const dataMD = useDeepMemo(() => {
      const data = head(filterMdIndexedDepthMeasurements(allData));

      if (!data) {
        return EMPTY_ARRAY;
      }

      return adaptMeasurementDataToColumn(data, pressureUnit);
    }, [allData, pressureUnit]);

    const dataTVD = useDeepMemo(() => {
      const data = head(filterTvdIndexedDepthMeasurements(allData));

      if (!data) {
        return EMPTY_ARRAY;
      }

      return adaptMeasurementDataToColumn(data, pressureUnit);
    }, [allData, pressureUnit]);

    const data = isMdScale ? dataMD : dataTVD;

    const filteredData = useDeepMemo(() => {
      if (!measurementTypesSelection) {
        return data;
      }
      return filterByMeasurementTypeParent(data, measurementTypesSelection);
    }, [data, measurementTypesSelection]);

    const getEmptySubtitle = () => {
      if (measurementTypesSelection && isEmpty(measurementTypesSelection)) {
        return NO_OPTIONS_SELECTED_TEXT;
      }
      if (!isEmpty(allData) && isEmpty(filteredData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return undefined;
    };

    const renderContent = () => {
      if (isEmpty(filteredData) || isLoading) {
        return (
          <ColumnEmptyState
            isLoading={isLoading}
            emptySubtitle={getEmptySubtitle()}
          />
        );
      }

      return (
        <BodyColumnBody>
          <DepthScaleLines scaleBlocks={scaleBlocks} />

          <FlexColumn>
            {filteredData.map((pressureData) => {
              const { id, depth } = pressureData;

              return (
                <PressureDataLabel
                  key={id}
                  data={pressureData}
                  scaledDepth={getScaledDepth(depth)}
                />
              );
            })}
          </FlexColumn>
        </BodyColumnBody>
      );
    };

    return (
      <Column
        id="measurements-column"
        isVisible={isVisible}
        {...dragHandleProps}
      >
        <ColumnHeaderWrapper>
          <BodyColumnMainHeader>
            {ChartColumn.MEASUREMENTS}
          </BodyColumnMainHeader>
        </ColumnHeaderWrapper>

        {renderContent()}
      </Column>
    );
  }
);
