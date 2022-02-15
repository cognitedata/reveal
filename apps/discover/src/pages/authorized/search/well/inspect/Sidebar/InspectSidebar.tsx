import React from 'react';
import { useTranslation } from 'react-i18next';

import { BlockExpander } from 'components/block-expander/BlockExpander';
import { HideButton } from 'components/buttons';
import { HorizontalResizableBox } from 'components/horizontal-resizable-box/HorizontalResizableBox';

import {
  HIDE_TEXT,
  EXPAND_TEXT,
  COLLAPSE_TEXT,
  SIDEBAR_SIZE,
} from './constants';
import {
  SidebarContainer,
  SidebarContentWrapper,
  HideButtonContainer,
} from './elements';
import { Header } from './Header';
import { SidebarContent } from './SidebarContent';

export interface Props {
  isOpen: boolean;
  hidden?: boolean;
  width: number;
  onToggle: () => void;
  onResize: (width: number) => void;
}

export const InspectSidebar: React.FC<Props> = ({
  isOpen,
  hidden = false,
  width,
  onToggle,
  onResize,
}) => {
  const { t } = useTranslation();

  const sidebarContent = () => (
    <SidebarContainer
      isOpen={isOpen}
      hidden={hidden}
      data-testid="inspect-sidebar"
    >
      <Header isOpen={isOpen} />
      <SidebarContentWrapper isOpen={isOpen}>
        {isOpen && (
          <>
            <SidebarContent />
            <HideButtonContainer>
              <HideButton
                text={t(HIDE_TEXT)}
                onClick={onToggle}
                aria-label={t(COLLAPSE_TEXT)}
                data-testid="well-inspect-sidebar-hide-btn"
              />
            </HideButtonContainer>
          </>
        )}
        {!isOpen && <BlockExpander text={t(EXPAND_TEXT)} onClick={onToggle} />}
      </SidebarContentWrapper>
    </SidebarContainer>
  );

  if (!isOpen) {
    return sidebarContent();
  }

  return (
    <HorizontalResizableBox
      width={hidden ? 0 : width}
      minWidth={SIDEBAR_SIZE.min}
      maxWidth={SIDEBAR_SIZE.max}
      onResize={onResize}
    >
      {sidebarContent()}
    </HorizontalResizableBox>
  );
};
