/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Section } from './Section';
import {
  InstructionText,
  TouchNavigationCombinedGridItem,
  TouchNavigationInstructionGrid
} from './elements';
import { TouchZoom, TouchPan, TouchSelect } from './Graphics/Touch';
import { useI18n } from '../../i18n/I18n';

export const TouchNavigation = (): ReactElement => {
  const { t } = useI18n();
  return (
    <Section
      title={t('TOUCH_NAVIGATION_TITLE', 'Touch')}
      subTitle={t('MOUSE_TOUCH_NAVIGATION_SUBTITLE', 'Navigate and select')}
      description={t('TOUCH_NAVIGATION_DESCRIPTION', 'Use gestures to zoom, pan and select')}>
      <TouchNavigationInstructionGrid>
        <div>
          <TouchPan />
          <InstructionText>{t('PAN', 'Pan')}</InstructionText>
        </div>
        <TouchNavigationCombinedGridItem>
          <TouchSelect />
          <InstructionText>{t('TOUCH_SELECT', 'Tap to select')}</InstructionText>
        </TouchNavigationCombinedGridItem>
        <div>
          <TouchZoom />
          <InstructionText>{t('TOUCH_ZOOM', 'Zoom')}</InstructionText>
        </div>
      </TouchNavigationInstructionGrid>
    </Section>
  );
};
