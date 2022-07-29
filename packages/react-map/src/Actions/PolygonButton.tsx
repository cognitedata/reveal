import React from 'react';
import { IconType, Button, Tooltip } from '@cognite/cogs.js';

import { CANCEL_POLYGON, POLYGON_TOOL } from '../constants';

import { ButtonContainer } from './elements';

interface Props {
  onToggle: () => void;
  isActive: boolean;
}

export const PolygonButton: React.FC<Props> = React.memo(
  ({ onToggle, isActive }) => {
    return (
      <ButtonContainer selected={isActive}>
        <Tooltip content="Free draw">
          <Button
            data-testid="freedraw-button"
            type={isActive ? 'ghost-danger' : 'ghost'}
            icon={(!isActive && 'Polygon') as IconType}
            onClick={onToggle}
            aria-label="Freedraw button"
          >
            {isActive ? CANCEL_POLYGON : POLYGON_TOOL}
          </Button>
        </Tooltip>
      </ButtonContainer>
    );
  }
);
