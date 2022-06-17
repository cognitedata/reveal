import React from 'react';

import { Tooltip } from 'components/PopperTooltip';

import { useScaledDepth } from '../../../hooks/useScaledDepth';
import { CasingsView } from '../../../types';
import {
  DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT,
  RKB_LEVEL_LABEL,
  WATER_DEPTH_LABEL,
} from '../../constants';

import {
  DepthLabel,
  RkbLevel,
  TopContentWrapper,
  WaterDepth,
} from './elements';

interface TopContentAreaProps {
  label: string;
  value: number;
  unit: string;
  Wrapper: React.FC<{ height: number; pointer: boolean }>;
  height: number;
}

interface TopContentProps extends Pick<CasingsView, 'rkbLevel' | 'waterDepth'> {
  scaleBlocks: number[];
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
  rkbLevel,
  waterDepth,
  scaleBlocks,
}) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  return (
    <TopContentWrapper>
      <TopContentArea
        label={RKB_LEVEL_LABEL}
        value={rkbLevel.value}
        unit={rkbLevel.unit}
        Wrapper={RkbLevel}
        height={getScaledDepth(rkbLevel.value)}
      />
      <TopContentArea
        label={WATER_DEPTH_LABEL}
        value={waterDepth.value}
        unit={waterDepth.unit}
        Wrapper={WaterDepth}
        height={getScaledDepth(waterDepth.value)}
      />
    </TopContentWrapper>
  );
};
