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
import { useTranslation } from '../../../common/i18n';

export const TouchNavigation = (): ReactElement => {
  const { t } = useTranslation();
  return (
    <Section
      title={t('TOUCH_NAVIGATION_TITLE')}
      subTitle={t('MOUSE_TOUCH_NAVIGATION_SUBTITLE')}
      description={t('TOUCH_NAVIGATION_DESCRIPTION')}>
      <TouchNavigationInstructionGrid>
        <div>
          <TouchPan />
          <InstructionText>{t('PAN')}</InstructionText>
        </div>
        <TouchNavigationCombinedGridItem>
          <TouchSelect />
          <InstructionText>{t('TOUCH_SELECT')}</InstructionText>
        </TouchNavigationCombinedGridItem>
        <div>
          <TouchZoom />
          <InstructionText>{t('TOUCH_ZOOM')}</InstructionText>
        </div>
      </TouchNavigationInstructionGrid>
    </Section>
  );
};
