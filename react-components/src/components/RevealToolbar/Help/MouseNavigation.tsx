/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { InstructionDetail, InstructionText, MouseGraphic, MouseNavigationGrid } from './elements';
import { MenuSection } from './MenuSection';

export const MouseNavigation = (): ReactElement => {
  return (
    <MenuSection
      title={'Mouse'}
      subTitle={'Navigate and select'}
      description={
        'Click and drag to rotate, and pan the view. Use mouse wheel to zoom the view. Left click to select'
      }>
      <MouseNavigationGrid>
        <InstructionText>{'Zoom / scroll'}</InstructionText>
        <InstructionText>
          {'Rotate'}
          <br />
          <InstructionDetail>{'Click+drag'}</InstructionDetail>
        </InstructionText>
        <MouseGraphic />
        <InstructionText>
          {'Pan'}
          <br />
          <InstructionDetail>{'Click+drag'}</InstructionDetail>
        </InstructionText>
        <InstructionText>
          {'Select Objects'}
          <br />
          <InstructionDetail>{'Click on interactive objects'}</InstructionDetail>
        </InstructionText>
      </MouseNavigationGrid>
    </MenuSection>
  );
};
