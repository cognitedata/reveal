/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Section } from './Section';
import {
  InstructionText,
  TouchNavigationCombinedGridItem,
  TouchNavigationInstructionGrid
} from './elements';
import { TouchZoom, TouchPan, TouchSelect } from './Graphics/Touch';

export const TouchNavigation = (): ReactElement => {
  return (
    <Section
      title={'Touch'}
      subTitle={'Navigate and select'}
      description={'Use gestures to zoom, pan and select'}>
      <TouchNavigationInstructionGrid>
        <div>
          <TouchPan />
          <InstructionText>Pan</InstructionText>
        </div>
        <TouchNavigationCombinedGridItem>
          <TouchSelect />
          <InstructionText>Tap to select</InstructionText>
        </TouchNavigationCombinedGridItem>
        <div>
          <TouchZoom />
          <InstructionText>Zoom</InstructionText>
        </div>
      </TouchNavigationInstructionGrid>
    </Section>
  );
};
