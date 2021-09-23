import React from 'react';

import {
  Container,
  CenterPanel,
  LeftPanel,
  RightPanel,
  PanelContent,
} from './elements';

const defaultSidePanelWidth = 324;

export interface CollapsablePanelProps {
  /**
   * The React component that's rendered in the left sidepanel
   */
  sidePanelLeft?: React.ReactNode;
  /**
   * The React component that's rendered in the right sidepanel
   */
  sidePanelRight?: React.ReactNode;
  /**
   * Show and hide the left sidepanel
   */
  sidePanelLeftVisible?: boolean;
  /**
   * Show and hide the right sidepanel
   */
  sidePanelRightVisible?: boolean;
  /**
   * Width of the left sidepanel in pixels (defaults to 324px)
   */
  sidePanelLeftWidth?: number;
  /**
   * Width of the right sidepanel in pixels (defaults to 324px)
   */
  sidePanelRightWidth?: number;
}

export const CollapsablePanel: React.FC<CollapsablePanelProps> = ({
  sidePanelLeft,
  sidePanelRight,
  sidePanelLeftVisible,
  sidePanelRightVisible,
  sidePanelLeftWidth = defaultSidePanelWidth,
  sidePanelRightWidth = defaultSidePanelWidth,
  children,
}) => {
  return (
    <Container>
      {sidePanelLeft && (
        <LeftPanel
          visible={sidePanelLeftVisible || false}
          width={sidePanelLeftWidth}
        >
          <PanelContent>{sidePanelLeft}</PanelContent>
        </LeftPanel>
      )}
      <CenterPanel
        left={sidePanelLeftVisible && sidePanelLeftWidth}
        right={sidePanelRightVisible && sidePanelRightWidth}
      >
        {children}
      </CenterPanel>
      {sidePanelRight && (
        <RightPanel
          visible={sidePanelRightVisible || false}
          width={sidePanelRightWidth}
        >
          <PanelContent>{sidePanelRight}</PanelContent>
        </RightPanel>
      )}
    </Container>
  );
};
