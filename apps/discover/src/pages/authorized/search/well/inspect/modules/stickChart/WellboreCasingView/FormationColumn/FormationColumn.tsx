import { WellTopsInternal } from 'domain/wells/wellTops/internal/types';

import * as React from 'react';

import isUndefined from 'lodash/isUndefined';

import { WithDragHandleProps } from 'components/DragDropContainer';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';

import { FormationTops, FormationWrapper } from './elements';
import { FormationCollection } from './FormationCollection';

type Props = {
  scaleBlocks: number[];
  isLoading: boolean;
  wellTop?: WellTopsInternal;
};

export const FormationColumn: React.FC<WithDragHandleProps<Props>> = ({
  scaleBlocks,
  isLoading,
  wellTop,
  ...dragHandleProps
}: Props) => {
  const wellTopSurface = wellTop?.tops;

  if (isLoading || isUndefined(wellTopSurface)) {
    return null;
  }

  return (
    <>
      <FormationWrapper>
        <ColumnDragger {...dragHandleProps} />
        <FormationTops>
          <FormationCollection
            wellTopsSurface={wellTopSurface}
            scaleBlocks={scaleBlocks}
          />
        </FormationTops>
      </FormationWrapper>
    </>
  );
};
