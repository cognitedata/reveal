import * as React from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
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
  scaleBlocksTVD?: number[];
  depthMeasurementType?: DepthMeasurementUnit;
}

export const DepthColumn: React.FC<WithDragHandleProps<DepthColumnProps>> =
  React.memo(
    ({
      scaleBlocks,
      scaleBlocksTVD = EMPTY_ARRAY,
      depthMeasurementType,
      isVisible = true,
      ...dragHandleProps
    }) => {
      const { data: depthUnit } = useUserPreferencesMeasurement();

      const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;
      const isTvdScale = depthMeasurementType === DepthMeasurementUnit.TVD;

      const MdScale = useDeepMemo(() => {
        return scaleBlocks.map((scaleValue) => {
          return (
            <ScaleLine key={`${DepthMeasurementUnit.MD}-${scaleValue}`}>
              <ScaleLineDepth>{formatScaleValue(scaleValue)}</ScaleLineDepth>
            </ScaleLine>
          );
        });
      }, [scaleBlocks]);

      const TvdScale = useDeepMemo(() => {
        return scaleBlocksTVD.map((scaleValue) => {
          return (
            <ScaleLine key={`${DepthMeasurementUnit.TVD}-${scaleValue}`}>
              <ScaleLineDepth>{formatScaleValue(scaleValue)}</ScaleLineDepth>
            </ScaleLine>
          );
        });
      }, [scaleBlocksTVD]);

      return (
        <NoUnmountShowHide show={isVisible}>
          <BodyColumn width={100}>
            <ColumnDragger {...dragHandleProps} />

            <ColumnHeaderWrapper>
              <BodyColumnMainHeader>
                {depthMeasurementType}
              </BodyColumnMainHeader>
              <FlexGrow />
              <BodyColumnMainHeader>{depthUnit}</BodyColumnMainHeader>
            </ColumnHeaderWrapper>

            <BodyColumnBody>
              <DepthMeasurementScale>
                <NoUnmountShowHide show={isVisible && isMdScale}>
                  {MdScale}
                </NoUnmountShowHide>

                <NoUnmountShowHide show={isVisible && isTvdScale}>
                  {TvdScale}
                </NoUnmountShowHide>
              </DepthMeasurementScale>
            </BodyColumnBody>
          </BodyColumn>
        </NoUnmountShowHide>
      );
    }
  );
