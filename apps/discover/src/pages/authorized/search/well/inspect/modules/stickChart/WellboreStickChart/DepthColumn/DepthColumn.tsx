import * as React from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { DepthMeasurementUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { FlexGrow } from 'styles/layout';

import {
  BodyColumnBody,
  BodyColumnMainHeader,
  ColumnHeaderWrapper,
  DepthMeasurementScale,
  ScaleLine,
  ScaleLineDepth,
} from '../../../common/Events/elements';
import { Column } from '../../components/Column';
import { ColumnOptionsSelector } from '../../components/ColumnOptionsSelector';
import { ColumnVisibilityProps } from '../../types';
import { formatScaleValue } from '../../utils/scale/formatScaleValue';
import { DEPTH_MEASUREMENT_TYPES } from '../constants';

export interface DepthColumnProps extends ColumnVisibilityProps {
  scaleBlocks: number[];
  depthMeasurementType: DepthMeasurementUnit;
  onChangeDepthMeasurementType: (
    depthMeasurementType: DepthMeasurementUnit
  ) => void;
}

export const DepthColumn: React.FC<WithDragHandleProps<DepthColumnProps>> =
  React.memo(
    ({
      scaleBlocks,
      depthMeasurementType,
      onChangeDepthMeasurementType,
      isVisible = true,
      ...dragHandleProps
    }) => {
      const { data: depthUnit } = useUserPreferencesMeasurement();

      return (
        <Column
          data-testid="depth-column"
          isVisible={isVisible}
          width={90}
          {...dragHandleProps}
        >
          <ColumnHeaderWrapper data-testid="column-header">
            <ColumnOptionsSelector
              options={DEPTH_MEASUREMENT_TYPES}
              selectedOption={depthMeasurementType}
              onChange={onChangeDepthMeasurementType}
            />
            <FlexGrow />
            <BodyColumnMainHeader>{depthUnit}</BodyColumnMainHeader>
          </ColumnHeaderWrapper>

          <BodyColumnBody>
            <DepthMeasurementScale>
              {scaleBlocks.map((scaleValue) => {
                return (
                  <ScaleLine key={`${depthMeasurementType}-${scaleValue}`}>
                    <ScaleLineDepth>
                      {formatScaleValue(scaleValue)}
                    </ScaleLineDepth>
                  </ScaleLine>
                );
              })}
            </DepthMeasurementScale>
          </BodyColumnBody>
        </Column>
      );
    }
  );
