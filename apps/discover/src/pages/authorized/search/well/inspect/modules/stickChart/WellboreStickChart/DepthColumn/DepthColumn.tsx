import * as React from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { DepthMeasurementUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { FlexGrow } from 'styles/layout';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnMainHeader,
  ColumnHeaderWrapper,
  DepthMeasurementScale,
  ScaleLine,
  ScaleLineDepth,
} from '../../../common/Events/elements';
import { ColumnVisibilityProps } from '../../types';
import { formatScaleValue } from '../../utils/scale/formatScaleValue';

export interface DepthColumnProps extends ColumnVisibilityProps {
  scaleBlocks: number[];
  depthMeasurementType: DepthMeasurementUnit;
}

export const DepthColumn: React.FC<WithDragHandleProps<DepthColumnProps>> =
  React.memo(
    ({
      scaleBlocks,
      depthMeasurementType,
      isVisible = true,
      ...dragHandleProps
    }) => {
      const { data: depthUnit } = useUserPreferencesMeasurement();

      return (
        <NoUnmountShowHide show={isVisible}>
          <BodyColumn width={80} data-testid="depth-column">
            <ColumnDragger {...dragHandleProps} />

            <ColumnHeaderWrapper>
              <BodyColumnMainHeader data-testid="column-header">
                {depthMeasurementType}
              </BodyColumnMainHeader>
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
          </BodyColumn>
        </NoUnmountShowHide>
      );
    }
  );
