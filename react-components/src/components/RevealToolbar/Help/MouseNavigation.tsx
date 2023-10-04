/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import {
  InstructionDetail,
  InstructionText,
  StyledMouse,
  MouseNavigationInstructionGrid,
  MouseNavigationCombinedGridItem
} from './elements';
import { Section } from './Section';
import { useTranslation } from '../../../common/i18n';

export const MouseNavigation = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <Section
      title={t('MOUSE_NAVIGATION_TITLE', 'Mouse')}
      subTitle={t('MOUSE_TOUCH_NAVIGATION_SUBTITLE', 'Navigate and select')}
      description={t(
        'MOUSE_NAVIGATION_DESCRIPTION',
        'Click and drag to rotate, and pan the view. Use mouse wheel to zoom the view. Left click to select'
      )}>
      <MouseNavigationInstructionGrid>
        <InstructionText>{t('MOUSE_ZOOM', 'Zoom / scroll')}</InstructionText>
        <InstructionText style={{ marginBottom: 30, textAlign: 'right' }}>
          {t('MOUSE_ROTATE', 'Rotate')}
          <InstructionDetail>{t('MOUSE_INSTRUCTIONS', 'Click+drag')}</InstructionDetail>
        </InstructionText>
        <MouseNavigationCombinedGridItem>
          <StyledMouse />
        </MouseNavigationCombinedGridItem>
        <InstructionText style={{ marginBottom: 30, textAlign: 'left' }}>
          {t('PAN', 'Pan')}
          <InstructionDetail>{t('MOUSE_INSTRUCTIONS', 'Click+drag')}</InstructionDetail>
        </InstructionText>
        <InstructionText style={{ marginTop: -50, textAlign: 'right' }}>
          {t('MOUSE_SELECT', 'Select Objects')}
          <InstructionDetail>
            {t('MOUSE_SELECT_INSTRUCTION', 'Click on interactive objects')}
          </InstructionDetail>
        </InstructionText>
      </MouseNavigationInstructionGrid>
    </Section>
  );
};
