import { useState, type ReactElement } from 'react';

import { Button, Tooltip as CogsTooltip, HelpIcon } from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import styled from 'styled-components';
import { MouseNavigation } from './Help/MouseNavigation';
import { TouchNavigation } from './Help/TouchNavigation';
import { KeyboardNavigation } from './Help/KeyboardNavigation';
import { useTranslation } from '../i18n/I18n';
import { type PlacementType } from '../Architecture';

/**
 * @deprecated
 */
export type HelpButtonProps = {
  fallbackLanguage?: string;
  placement?: PlacementType;
};

/**
 * @deprecated
 */

export const HelpButton = ({ fallbackLanguage, placement }: HelpButtonProps): ReactElement => {
  const { t } = useTranslation(fallbackLanguage);
  const [helpActive, setHelpActive] = useState<boolean>(false);

  return (
    <Dropdown
      onClickOutside={() => {
        setHelpActive(false);
      }}
      onHide={() => {
        setHelpActive(false);
      }}
      placement={placement ?? 'right'}
      content={
        <StyledContainer>
          <MouseNavigation fallbackLanguage={fallbackLanguage} />
          <KeyboardNavigation fallbackLanguage={fallbackLanguage} />
          <TouchNavigation fallbackLanguage={fallbackLanguage} />
        </StyledContainer>
      }>
      <CogsTooltip content={t({ key: 'HELP_TOOLTIP' })} placement={'right'}>
        <Button
          type="ghost"
          icon={<HelpIcon />}
          aria-label="help-button"
          toggled={helpActive}
          onClick={() => {
            if (!helpActive) {
              setHelpActive(true);
            }
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
  max-height: 20vw;
  overflow-y: auto;
`;
