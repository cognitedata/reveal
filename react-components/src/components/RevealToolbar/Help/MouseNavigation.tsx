/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import {
  InstructionDetail,
  InstructionText,
  StyledMouse,
  MouseNavigationInstructionGrid,
  MouseNavigationCombinedGridItem
} from './elements';
import { Section } from './Section';

export const MouseNavigation = (): ReactElement => {
  return (
    <Section
      title={'Mouse'}
      subTitle={'Navigate and select'}
      description={
        'Click and drag to rotate, and pan the view. Use mouse wheel to zoom the view. Left click to select'
      }>
      <MouseNavigationInstructionGrid>
        <InstructionText>Zoom / scroll</InstructionText>
        <InstructionText style={{ marginBottom: 30, textAlign: 'right' }}>
          Rotate
          <InstructionDetail>Click+drag</InstructionDetail>
        </InstructionText>
        <MouseNavigationCombinedGridItem>
          <StyledMouse />
        </MouseNavigationCombinedGridItem>
        <InstructionText style={{ marginBottom: 30, textAlign: 'left' }}>
          Pan
          <InstructionDetail>Click+drag</InstructionDetail>
        </InstructionText>
        <InstructionText style={{ marginTop: -50, textAlign: 'right' }}>
          Select Objects
          <InstructionDetail>Click on interactive objects</InstructionDetail>
        </InstructionText>
      </MouseNavigationInstructionGrid>
    </Section>
  );
};
