import * as React from 'react';
import { IconType, Button, Tooltip } from '@cognite/cogs.js';

import { ButtonContainer } from '../elements';

import { CANCEL_POLYGON, POLYGON_TOOL } from './constants';

interface Props {
  onToggle: () => void;
  isActive: boolean;
}
export const PolygonButton: React.FC<Props> = React.memo(
  ({ onToggle, isActive }) => {
    return (
      <ButtonContainer>
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
