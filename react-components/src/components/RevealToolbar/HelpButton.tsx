/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';

import { Button, Dropdown, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { MouseNavigation } from './Help/MouseNavigation';
import { TouchNavigation } from './Help/TouchNavigation';
import { KeyboardNavigation } from './Help/KeyboardNavigation';
import { useTranslation } from '../i18n/I18n';

export const HelpButton = (): ReactElement => {
  const { t } = useTranslation();
  const [helpActive, setHelpActive] = useState<boolean>(false);

  return (
    <CogsTooltip content={t('HELP_TOOLTIP', 'Help')} placement="right" appendTo={document.body}>
      <Dropdown
        appendTo={document.body}
        onClickOutside={() => {
          setHelpActive(false);
        }}
        content={
          <StyledMenu>
            <MouseNavigation />
            <KeyboardNavigation />
            <TouchNavigation />
          </StyledMenu>
        }
        placement="right">
        <Button
          type="ghost"
          icon="Help"
          aria-label="help-button"
          toggled={helpActive}
          onClick={() => {
            setHelpActive((prevState) => !prevState);
          }}
        />
      </Dropdown>
    </CogsTooltip>
  );
};

const StyledMenu = styled.div`
  background-color: #516efa;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
  width: fit-content;
  max-width: fit-content;
`;
