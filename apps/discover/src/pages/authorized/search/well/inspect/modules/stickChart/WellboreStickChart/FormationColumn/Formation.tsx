import { WellTopSurfaceInternal } from 'domain/wells/wellTops/internal/types';

import { Tooltip } from '@cognite/cogs.js';

import { MinimumFormationIcon } from 'components/Icons/MinimumFormationIcon';

import { ColorBox, WellTopName } from './elements';

type Props = { surface: WellTopSurfaceInternal; wellTopScaledHeight: number };

export const Formation: React.FC<Props> = ({
  surface,
  wellTopScaledHeight,
}) => {
  return (
    <Tooltip content={surface.name} position="right">
      {wellTopScaledHeight > 20 ? (
        <ColorBox
          color={surface.color}
          key={surface.name}
          height={wellTopScaledHeight}
        >
          <WellTopName>{surface.name}</WellTopName>
        </ColorBox>
      ) : (
        <MinimumFormationIcon />
      )}
    </Tooltip>
  );
};
