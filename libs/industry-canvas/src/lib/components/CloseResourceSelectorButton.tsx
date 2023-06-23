import styled from 'styled-components';

import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { CANVAS_FLOATING_ELEMENT_MARGIN } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

type CloseResourceSelectorButtonProps = {
  onClick: () => void;
  isVisible: boolean;
};

export const CloseResourceSelectorButton = ({
  isVisible,
  onClick,
}: CloseResourceSelectorButtonProps) => {
  const { t } = useTranslation();
  if (!isVisible) {
    return null;
  }

  return (
    <TopRightAbsoluteWrapper>
      <ToolBar>
        <Tooltip
          content={t(
            translationKeys.CLOSE_RESOURCE_SELECTOR,
            'Close Resource Selector'
          )}
        >
          <Button
            icon="Close"
            type="ghost"
            aria-label={t(
              translationKeys.CLOSE_RESOURCE_SELECTOR,
              'Close Resource Selector'
            )}
            onClick={onClick}
          ></Button>
        </Tooltip>
      </ToolBar>
    </TopRightAbsoluteWrapper>
  );
};

const TopRightAbsoluteWrapper = styled.div`
  position: absolute;
  top: ${CANVAS_FLOATING_ELEMENT_MARGIN}px;
  right: ${CANVAS_FLOATING_ELEMENT_MARGIN}px;
`;
