import React from 'react';
import { Link } from 'react-router-dom';
import { TopBar } from '@cognite/cogs.js';

export enum PAGES {
  HOME = '/',
  SUPPORT = '/support',
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
  </TopBar>
);
