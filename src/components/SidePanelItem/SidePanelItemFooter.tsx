import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common/i18n';

import {
  SidePanelItemInternalProps,
  SidePanelItemProps,
} from './SidePanelItem';

type SidePanelItemFooterProps<T extends string> = Pick<
  SidePanelItemProps<T>,
  'footer'
> &
  SidePanelItemInternalProps<T>;

const SidePanelItemFooter = <T extends string>({
  activePanelKey,
  footer = true,
  onChange,
  onClose,
}: SidePanelItemFooterProps<T>): JSX.Element => {
  const { t } = useTranslation();

  if (!footer) {
    return <></>;
  }

  if (typeof footer === 'function') {
    return (
      <>
        {footer({
          activePanelKey,
          onChange,
          onClose,
        })}
      </>
    );
  }

  return (
    <StyledSidePanelItemFooter>
      <StyledHideButton icon="PanelLeft" onClick={onClose}>
        {t('explorer-side-panel-databases-button-hide')}
      </StyledHideButton>
    </StyledSidePanelItemFooter>
  );
};

const StyledSidePanelItemFooter = styled.div`
  padding: 16px;
  width: 100%;
`;

const StyledHideButton = styled(Button)`
  width: 100%;
`;

export default SidePanelItemFooter;
