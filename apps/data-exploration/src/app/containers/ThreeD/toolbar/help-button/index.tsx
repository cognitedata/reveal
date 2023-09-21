import styled from 'styled-components';

import { Button, Colors, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { ids } from '../../../../../cogs-variables';
import { EXPLORATION } from '../../../../constants/metrics';
import { trackUsage } from '../../../../utils/Metrics';

import {
  MouseNavigation,
  KeyboardNavigation,
  TouchNavigation,
} from './sections';

const HelpButton = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Dropdown
      appendTo={() => document.getElementsByClassName(ids.styleScope).item(0)!}
      content={
        <StyledMenu>
          <MouseNavigation />
          <TouchNavigation />
          <KeyboardNavigation />
        </StyledMenu>
      }
      placement="right-end"
    >
      <Tooltip content={t('HELP', 'Help')} placement="right">
        <FullWidthButton
          icon="Help"
          type="ghost"
          aria-label="help-button"
          onClick={() => {
            trackUsage(EXPLORATION.THREED_SELECT.NAVIGATION_HELP, {
              resourceType: '3D',
            });
          }}
        />
      </Tooltip>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  background-color: ${Colors['surface--medium--inverted']};
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
  width: fit-content;
`;

const FullWidthButton = styled(Button)`
  width: 100%;
`;

export default HelpButton;
