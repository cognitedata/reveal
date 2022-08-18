import { WellTopSurfaceInternal } from 'domain/wells/wellTops/internal/types';

import React from 'react';

import { DepthSegment } from '../SchemaColumn/components/DepthIndicator/DepthSegment';

import { Formation } from './Formation';
import { useProcessSurfaceData } from './useProcessFormationData';

type Props = {
  wellTopsSurface: WellTopSurfaceInternal[];
  scaleBlocks: number[];
};

export const FormationCollection: React.FC<Props> = ({
  wellTopsSurface,
  scaleBlocks,
}: Props) => {
  const processedData = useProcessSurfaceData(wellTopsSurface, scaleBlocks);

  return (
    <>
      {processedData.map((data) => {
        return (
          <React.Fragment key={data.surface.name}>
            <DepthSegment.Start height={`${data.startPosition}px`} />
            <Formation
              surface={data.surface}
              wellTopScaledHeight={data.wellTopScaledHeight}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
