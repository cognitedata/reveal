import React from 'react';

import { BlockExpander } from 'components/BlockExpander/BlockExpander';
import { HideButton } from 'components/Buttons';
import { HorizontalResizableBox } from 'components/HorizontalResizable-box/HorizontalResizableBox';
import { useTranslation } from 'hooks/useTranslation';

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
