import { type ReactElement } from 'react';
import { Section } from './Section';
import {
  InstructionText,
  TouchNavigationCombinedGridItem,
  TouchNavigationInstructionGrid
} from './elements';
import { TouchZoom, TouchPan, TouchSelect } from './Graphics/Touch';
import { useTranslation } from '../../i18n/I18n';

export type TouchNavigationProps = {
  fallbackLanguage?: string;
};

export const TouchNavigation = ({ fallbackLanguage }: TouchNavigationProps): ReactElement => {
  const { t } = useTranslation(fallbackLanguage);
  return (
    <Section
      title={t({ key: 'TOUCH_NAVIGATION_TITLE' })}
      subTitle={t({ key: 'MOUSE_TOUCH_NAVIGATION_SUBTITLE' })}
      description={t({ key: 'TOUCH_NAVIGATION_DESCRIPTION' })}>
      <TouchNavigationInstructionGrid>
        <div>
          <TouchPan />
          <InstructionText>{t({ key: 'PAN' })}</InstructionText>
        </div>
        <TouchNavigationCombinedGridItem>
          <TouchSelect />
          <InstructionText>{t({ key: 'TOUCH_SELECT' })}</InstructionText>
        </TouchNavigationCombinedGridItem>
        <div>
          <TouchZoom />
          <InstructionText>{t({ key: 'TOUCH_ZOOM' })}</InstructionText>
        </div>
      </TouchNavigationInstructionGrid>
    </Section>
  );
};
