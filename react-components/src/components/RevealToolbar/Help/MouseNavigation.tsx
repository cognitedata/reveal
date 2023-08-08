/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import {
  InstructionDetail,
  InstructionText,
  StyledMouse,
  NavigationInstructionGrid
} from './elements';
import { MenuSection } from './MenuSection';

export const MouseNavigation = (): ReactElement => {
  return (
    <MenuSection
      title={'Mouse'}
      subTitle={'Navigate and select'}
      description={
        'Click and drag to rotate, and pan the view. Use mouse wheel to zoom the view. Left click to select'
      }>
      <NavigationInstructionGrid>
        <InstructionText>{'Zoom / scroll'}</InstructionText>
        <InstructionText>
          {'Rotate'}
          <br />
          <InstructionDetail>{'Click+drag'}</InstructionDetail>
          <br />
          <br />
          <InstructionText>
            {'Select Objects'}
            <br />
            <InstructionDetail>{'Click on interactive objects'}</InstructionDetail>
          </InstructionText>
        </InstructionText>
        <StyledMouse />
        <InstructionText>
          {'Pan'}
          <br />
          <InstructionDetail>{'Click+drag'}</InstructionDetail>
        </InstructionText>
      </NavigationInstructionGrid>
    </MenuSection>
  );
};
