import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepCallback } from 'hooks/useDeep';

import { BodyColumnBody } from '../../../common/Events/elements';
import { Column } from '../../components/Column';
import { useScaledDepth } from '../../hooks/useScaledDepth';
import { ColumnVisibilityProps, WellTopSurfaceView } from '../../types';

import { FormationColumnEmptyState } from './components/FormationColumnEmptyState';
import { FormationLayer } from './components/FormationLayer';

export interface FormationColumnProps extends ColumnVisibilityProps {
  data?: WellTopSurfaceView[];
  isLoading: boolean;
  scaleBlocks: number[];
  depthMeasurementType: DepthMeasurementUnit;
}

export const FormationColumn: React.FC<
  WithDragHandleProps<FormationColumnProps>
> = React.memo(
  ({
    data,
    isLoading,
    scaleBlocks,
    depthMeasurementType,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const getScaledDepth = useScaledDepth(scaleBlocks);

    const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

    const renderFormationLayers = useDeepCallback(() => {
      if (!data || isEmpty(data)) {
        return <FormationColumnEmptyState isLoading={isLoading} />;
      }

      return data.map(({ name, top, depthDifference, color }) => {
        const topDepth = isMdScale ? top.measuredDepth : top.trueVerticalDepth;
        const differenceDepth = isMdScale
          ? depthDifference.measuredDepth
          : depthDifference.trueVerticalDepth;

        if (isUndefined(topDepth) || isUndefined(differenceDepth)) {
          return null;
        }

        return (
          <FormationLayer
            key={`${top.measuredDepth}-${name}`}
            name={name}
            scaledTop={getScaledDepth(topDepth)}
            scaledHeight={getScaledDepth(differenceDepth)}
            color={color}
          />
        );
      });
    }, [data, isLoading, depthMeasurementType, getScaledDepth]);

    return (
      <Column
        data-testid="formation-column"
        isVisible={isVisible}
        width={30}
        {...dragHandleProps}
      >
        <BodyColumnBody>{renderFormationLayers()}</BodyColumnBody>
      </Column>
    );
  }
);
