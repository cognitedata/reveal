import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useDeepCallback } from 'hooks/useDeep';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { BodyColumn, BodyColumnBody } from '../../../common/Events/elements';
import { useScaledDepth } from '../../hooks/useScaledDepth';
import { ColumnVisibilityProps, WellTopSurfaceView } from '../../types';

import { FormationColumnEmptyState } from './components/FormationColumnEmptyState';
import { FormationLayer } from './components/FormationLayer';

export interface FormationColumnProps extends ColumnVisibilityProps {
  data?: WellTopSurfaceView[];
  isLoading: boolean;
  scaleBlocks: number[];
}

export const FormationColumn: React.FC<
  WithDragHandleProps<FormationColumnProps>
> = React.memo(
  ({ data, isLoading, scaleBlocks, isVisible = true, ...dragHandleProps }) => {
    const getScaledDepth = useScaledDepth(scaleBlocks);

    const renderFormationLayers = useDeepCallback(() => {
      if (!data || isEmpty(data)) {
        return <FormationColumnEmptyState isLoading={isLoading} />;
      }

      return data.map(({ name, top, depthDifference, color }) => {
        return (
          <FormationLayer
            key={name}
            name={name}
            scaledTop={getScaledDepth(top.measuredDepth)}
            scaledHeight={getScaledDepth(depthDifference.measuredDepth)}
            color={color}
          />
        );
      });
    }, [data, isLoading, getScaledDepth]);

    return (
      <NoUnmountShowHide show={isVisible}>
        <BodyColumn data-testid="formation-column">
          <ColumnDragger {...dragHandleProps} />
          <BodyColumnBody>{renderFormationLayers()}</BodyColumnBody>
        </BodyColumn>
      </NoUnmountShowHide>
    );
  }
);
