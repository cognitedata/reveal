import React, { useContext } from 'react';

import { Button, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';
import { useActiveTable } from 'hooks/table-tabs';
import { SIDE_PANEL_FOOTER_HEIGHT } from 'utils/constants';
import { useTranslation } from 'common/i18n';

const StyledSidePanelFooterWrapper = styled.div`
  border-top: 1px solid ${Colors['border-default']};
  height: ${SIDE_PANEL_FOOTER_HEIGHT}px;
  padding: 16px;
`;

const SidePanelFooter = (): JSX.Element => {
  const { t } = useTranslation();
  const { setIsSidePanelOpen } = useContext(RawExplorerContext);

  const [[activeDatabase, activeTable] = []] = useActiveTable();

  return (
    <StyledSidePanelFooterWrapper>
      <Button
        block
        disabled={!(activeDatabase && activeTable)}
        icon="PanelLeft"
        onClick={() => setIsSidePanelOpen(false)}
        type="secondary"
      >
        {t('explorer-side-panel-databases-button-hide')}
      </Button>
    </StyledSidePanelFooterWrapper>
  );
};

export default SidePanelFooter;
