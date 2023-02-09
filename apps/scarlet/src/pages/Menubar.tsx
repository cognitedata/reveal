import React from 'react';
import { Link } from 'react-router-dom-v5';
import { Label, TopBar } from '@cognite/cogs.js';

import { version } from '../../package.json';

export enum PAGES {
  HOME = '/',
  FACILITY = '/:facility',
  UNIT = '/:facility/:unitId',
  EQUIPMENT = '/:facility/:unitId/:equipmentId',
}

export const MenuBar = () => (
  <TopBar data-testid="top-bar">
    <TopBar.Left>
      <Link to={PAGES.HOME}>
        <TopBar.Logo title="Cognite Scarlet" />
      </Link>
    </TopBar.Left>
    <TopBar.Right>
      <Label>{version}</Label>
    </TopBar.Right>
  </TopBar>
);
