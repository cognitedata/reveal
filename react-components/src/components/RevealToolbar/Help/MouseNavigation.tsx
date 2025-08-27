import { type ReactElement } from 'react';
import {
  InstructionDetail,
  InstructionText,
  StyledMouse,
  MouseNavigationInstructionGrid,
  MouseNavigationCombinedGridItem
} from './elements';
import { Section } from './Section';
import { useTranslation } from '../../i18n/I18n';

export type MouseNavigationProps = {
  fallbackLanguage?: string;
};

export const MouseNavigation = ({ fallbackLanguage }: MouseNavigationProps): ReactElement => {
  const { t } = useTranslation(fallbackLanguage);
  return (
    <Section
      title={t({ key: 'MOUSE_NAVIGATION_TITLE' })}
      subTitle={t({ key: 'MOUSE_TOUCH_NAVIGATION_SUBTITLE' })}
      description={t({ key: 'MOUSE_NAVIGATION_DESCRIPTION' })}>
      <MouseNavigationInstructionGrid>
        <InstructionText>{t({ key: 'MOUSE_ZOOM' })}</InstructionText>
        <InstructionText
          style={{ marginBottom: 30, textAlign: 'right', width: 'max-content', maxWidth: '100px' }}>
          {t({ key: 'MOUSE_ROTATE' })}
          <InstructionDetail>{t({ key: 'MOUSE_INSTRUCTIONS' })}</InstructionDetail>
        </InstructionText>
        <MouseNavigationCombinedGridItem>
          <StyledMouse />
        </MouseNavigationCombinedGridItem>
        <InstructionText
          style={{ marginBottom: 30, textAlign: 'left', width: 'max-content', maxWidth: '100px' }}>
          {t({ key: 'PAN' })}
          <InstructionDetail>{t({ key: 'MOUSE_INSTRUCTIONS' })}</InstructionDetail>
        </InstructionText>
        <InstructionText
          style={{ marginTop: -50, textAlign: 'right', width: 'max-content', maxWidth: '100px' }}>
          {t({ key: 'MOUSE_SELECT' })}
          <InstructionDetail>{t({ key: 'MOUSE_SELECT_INSTRUCTION' })}</InstructionDetail>
        </InstructionText>
      </MouseNavigationInstructionGrid>
    </Section>
  );
};
