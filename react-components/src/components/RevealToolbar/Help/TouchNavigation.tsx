/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { MenuSection } from './MenuSection';
import { InstructionText, MouseNavigationGrid } from './elements';
import { TouchZoom, TouchPan, TouchSelect } from '../../Graphics/Touch';

export const TouchNavigation = (): ReactElement => {
  return (
    <MenuSection
      title={'Touch'}
      subTitle={'Navigate and select'}
      description={'Use gestures to zoom, pan and select'}>
      <MouseNavigationGrid>
        <TouchPan />
        <InstructionText>{'Pan'}</InstructionText>
        {/* <br /> */}
        <TouchZoom />
        <InstructionText>{'Zoom'}</InstructionText>
        {/* <br /> */}
        <TouchSelect />
        <InstructionText>{'Tap to select'}</InstructionText>
      </MouseNavigationGrid>
    </MenuSection>
  );
};
