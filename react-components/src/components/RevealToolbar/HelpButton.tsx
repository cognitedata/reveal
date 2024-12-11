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
    <Dropdown
      appendTo={document.body}
      onClickOutside={() => {
        setHelpActive(false);
      }}
      placement="right"
      content={
        <StyledContainer>
          <MouseNavigation fallbackLanguage={fallbackLanguage} />
          <KeyboardNavigation fallbackLanguage={fallbackLanguage} />
          <TouchNavigation fallbackLanguage={fallbackLanguage} />
        </StyledContainer>
      }>
      <CogsTooltip content={t({ key: 'HELP_TOOLTIP' })} placement="right" appendTo={document.body}>
        <Button
          type="ghost"
          icon={<HelpIcon />}
          aria-label="help-button"
          toggled={helpActive}
          onClick={() => {
            setHelpActive((prevState) => !prevState);
          }}
        />
      </CogsTooltip>
    </Dropdown>
  );
};

const StyledContainer = styled.div`
  background-color: #516efa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  width: fit-content;
  max-height: 50vw;
  overflow-y: auto;
`;
