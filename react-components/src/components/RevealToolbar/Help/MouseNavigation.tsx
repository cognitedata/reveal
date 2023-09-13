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
      title={t('MOUSE_NAVIGATION_TITLE')}
      subTitle={t('MOUSE_TOUCH_NAVIGATION_SUBTITLE')}
      description={t('MOUSE_NAVIGATION_DESCRIPTION')}>
      <MouseNavigationInstructionGrid>
        <InstructionText>{t('MOUSE_ZOOM')}</InstructionText>
        <InstructionText style={{ marginBottom: 30, textAlign: 'right' }}>
          {t('MOUSE_ROTATE')}
          <InstructionDetail>{t('MOUSE_INSTRUCTIONS')}</InstructionDetail>
        </InstructionText>
        <MouseNavigationCombinedGridItem>
          <StyledMouse />
        </MouseNavigationCombinedGridItem>
        <InstructionText style={{ marginBottom: 30, textAlign: 'left' }}>
          {t('PAN')}
          <InstructionDetail>{t('MOUSE_INSTRUCTIONS')}</InstructionDetail>
        </InstructionText>
        <InstructionText style={{ marginTop: -50, textAlign: 'right' }}>
          {t('MOUSE_SELECT')}
          <InstructionDetail>{t('MOUSE_SELECT_INSTRUCTION')}</InstructionDetail>
        </InstructionText>
      </MouseNavigationInstructionGrid>
    </Section>
  );
};
