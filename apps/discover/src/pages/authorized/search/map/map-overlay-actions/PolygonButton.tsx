import React from 'react';
import { useTranslation } from 'react-i18next';

import { AllIconTypes, Button, Tooltip } from '@cognite/cogs.js';

import { CANCEL_POLYGON, POLYGON_TOOL } from '../constants';

import { ButtonContainer } from './elements';

interface Props {
  onToggle: () => void;
  isActive: boolean;
}

export const PolygonButton: React.FC<Props> = React.memo(
  ({ onToggle, isActive }) => {
    const { t } = useTranslation('Search');

    return (
      <ButtonContainer selected={isActive}>
        <Tooltip content={t('Free draw')}>
          <Button
            data-testid="freedraw-button"
            type={isActive ? 'ghost-danger' : 'ghost'}
            icon={(!isActive && 'Polygon') as AllIconTypes}
            onClick={onToggle}
            aria-label="Freedraw button"
          >
            {t(isActive ? CANCEL_POLYGON : POLYGON_TOOL)}
          </Button>
        </Tooltip>
      </ButtonContainer>
    );
  }
);

export default PolygonButton;
