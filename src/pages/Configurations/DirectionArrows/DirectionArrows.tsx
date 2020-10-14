import React from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import { ArrowsContainer, Arrow } from './elements';

type Props = {
  psToOw: boolean;
};

const DirectionArrows = ({ psToOw = true }: Props) => {
  return (
    <ArrowsContainer>
      <Arrow
        isTop
        arrowColor={
          psToOw ? Colors.danger.hex() : Colors['greyscale-grey4'].hex()
        }
      >
        <Icon type="ArrowRight" />
      </Arrow>
      <Arrow
        isTop={false}
        arrowColor={
          !psToOw ? Colors.midblue.hex() : Colors['greyscale-grey4'].hex()
        }
      >
        <Icon type="ArrowLeft" />
      </Arrow>
    </ArrowsContainer>
  );
};

export default DirectionArrows;
