import React, { useContext } from 'react';

import { Button, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';
import { SIDE_PANEL_FOOTER_HEIGHT } from 'utils/constants';

const StyledSidePanelFooterWrapper = styled.div`
  border-top: 1px solid ${Colors['border-default']};
  height: ${SIDE_PANEL_FOOTER_HEIGHT}px;
  padding: 16px;
`;

const SidePanelFooter = (): JSX.Element => {
  const { setIsSidePanelOpen } = useContext(RawExplorerContext);

  return (
    <StyledSidePanelFooterWrapper>
      <Button
        block
        icon="PanelLeft"
        onClick={() => setIsSidePanelOpen(false)}
        type="secondary"
      >
        Hide
      </Button>
    </StyledSidePanelFooterWrapper>
  );
};

export default SidePanelFooter;
