/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';

import { Button, Tooltip as CogsTooltip, HelpIcon } from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import styled from 'styled-components';
import { MouseNavigation } from './Help/MouseNavigation';
import { TouchNavigation } from './Help/TouchNavigation';
import { KeyboardNavigation } from './Help/KeyboardNavigation';
import { useTranslation } from '../i18n/I18n';

export type HelpButtonProps = {
  fallbackLanguage?: string;
};

export const HelpButton = ({ fallbackLanguage }: HelpButtonProps): ReactElement => {
  const { t } = useTranslation(fallbackLanguage);
  const [helpActive, setHelpActive] = useState<boolean>(false);

  return (
    <CogsTooltip content={t('HELP_TOOLTIP', 'Help')} placement="right" appendTo={document.body}>
      <Dropdown
        onClickOutside={() => {
          setHelpActive(false);
        }}
        content={
          <StyledContainer>
            <MouseNavigation fallbackLanguage={fallbackLanguage} />
            <KeyboardNavigation fallbackLanguage={fallbackLanguage} />
            <TouchNavigation fallbackLanguage={fallbackLanguage} />
          </StyledContainer>
        }
        placement="right">
        <Button
          type="ghost"
          icon=<HelpIcon />
          aria-label="help-button"
          toggled={helpActive}
          onClick={() => setHelpActive((prevState) => !prevState)}
        />
      </Dropdown>
    </CogsTooltip>
  );
};

const StyledContainer = styled.div`
  background-color: #516efa;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
  width: fit-content;
  max-width: fit-content;
`;
