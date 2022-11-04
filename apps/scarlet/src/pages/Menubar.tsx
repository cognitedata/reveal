import React from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';
import { useApi } from 'hooks';
import { callScarletScanner } from 'api';

export enum PAGES {
  HOME = '/',
  FACILITY = '/:facility',
  UNIT = '/:facility/:unitId',
  EQUIPMENT = '/:facility/:unitId/:equipmentId',
}

export const MenuBar = () => {
  const { state, trigger: triggerDocumentScans } = useApi(
    callScarletScanner,
    {},
    { skip: true }
  );

  return (
    <TopBar data-testid="top-bar">
      <TopBar.Left>
        <Link to={PAGES.HOME}>
          <TopBar.Logo title="Cognite Scarlet" />
        </Link>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Action
          interactable={!state.loading}
          text="Trigger Scarlet Scanner"
          onClick={triggerDocumentScans}
          icon={state.loading ? 'Loader' : 'Play'}
        />
      </TopBar.Right>
    </TopBar>
  );
};
