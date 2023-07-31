import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import * as React from 'react';

import { Tooltip } from 'components/PopperTooltip';

import { useScaledDepth } from '../../../hooks/useScaledDepth';
import {
  DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT,
  DATUM_TYPE_LABEL,
  WATER_DEPTH_LABEL,
} from '../../constants';
import {
  DepthLabel,
  DatumTypeLevel,
  TopContentWrapper,
  WaterDepth,
} from '../elements';

interface TopContentAreaProps {
  label: string;
  value: number;
  unit: string;
  Wrapper: React.FC<
    React.PropsWithChildren<{ height: number; pointer: boolean }>
  >;
  height: number;
}

interface TopContentProps {
  scaleBlocks: number[];
  datum: WellboreInternal['datum'];
  waterDepth: WellboreInternal['wellWaterDepth'];
}

export const TopContentArea: React.FC<TopContentAreaProps> = ({
  label,
  value,
  unit,
  Wrapper,
  height,
}) => {
  const roundedValue = Math.round(value);

  return (
    <Tooltip
      followCursor
      content={`${roundedValue} (${unit}) - ${label}`}
      disabled={height > DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT}
    >
      <Wrapper
        height={height}
        pointer={height <= DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT}
      >
        {height > DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT && (
          <Tooltip content={label} placement="right">
            <DepthLabel>
              {roundedValue} ({unit})
            </DepthLabel>
          </Tooltip>
        )}
      </Wrapper>
    </Tooltip>
  );
};

export const TopContent: React.FC<TopContentProps> = ({
  datum,
  waterDepth,
  scaleBlocks,
}) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  return (
    <TopContentWrapper>
      {datum && (
        <TopContentArea
          label={DATUM_TYPE_LABEL}
          value={datum.value}
          unit={datum.unit}
          Wrapper={DatumTypeLevel}
          height={getScaledDepth(datum.value)}
        />
      )}

      {waterDepth && (
        <TopContentArea
          label={WATER_DEPTH_LABEL}
          value={waterDepth.value}
          unit={waterDepth.unit}
          Wrapper={WaterDepth}
          height={getScaledDepth(waterDepth.value)}
        />
      )}
    </TopContentWrapper>
  );
};
