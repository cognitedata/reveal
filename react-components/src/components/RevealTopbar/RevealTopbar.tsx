import { TopBar } from '@cognite/cogs.js';
import { FitModelsButton } from '../RevealToolbar/FitModelsButton';
import { LayersButton } from '../RevealToolbar/LayersButton';
import React, { ReactElement } from 'react';

const DefaultContentWrapper = (): ReactElement => {
  return (
    <>
      <LayersButton />
      <FitModelsButton />
    </>
  );
};

export const RevealTopbar = (): ReactElement => {
  return (
    <TopBar>
      <DefaultContentWrapper />
    </TopBar>
  );
};
