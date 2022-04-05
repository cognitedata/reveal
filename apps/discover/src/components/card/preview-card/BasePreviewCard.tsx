import React from 'react';

import { Button, IconType, Label } from '@cognite/cogs.js';

import { CloseButton } from 'components/buttons';
import Divider from 'components/divider';
import { CopyIcon } from 'components/document-preview/elements';
import { FlexGrow } from 'styles/layout';

import {
  Container,
  Content,
  CopyIconContainer,
  CopyToClipboardContainer,
  DividerContainer,
  HeaderContainer,
  PreviewTitleAlignItems,
  TooltipContainer,
} from './elements';
import TitleComponent from './Title';

interface Props {
  title: string;
  handleCloseClick?: () => void;
  actions?: React.ReactElement;
  collapsible?: boolean;
  icon?: IconType;
}
export const BasePreviewCard: React.FC<Props> = ({
  title,
  handleCloseClick,
  children,
  actions,
  collapsible,
  icon,
}) => {
  const [isCollapsed, setCollapsed] = React.useState(false);

  return (
    <div data-testid={`well-card-${title}`}>
      <Container classNames="z-4" elevation={2}>
        <Content collapsed={isCollapsed}>
          <HeaderContainer>
            <PreviewTitleAlignItems>
              {icon && <Label icon={icon} />}
              <TitleComponent>{title}</TitleComponent>
              <FlexGrow />
              {collapsible && (
                <Button
                  icon="Collapse"
                  type="ghost"
                  onClick={() => setCollapsed((prevState) => !prevState)}
                  aria-label="Minimize"
                />
              )}
              <TooltipContainer
                content="Copy to Clipboard"
                key={title}
                placement="right"
              >
                <CopyToClipboardContainer text={title}>
                  <CopyIconContainer>
                    <CopyIcon type="Copy" />
                  </CopyIconContainer>
                </CopyToClipboardContainer>
              </TooltipContainer>
            </PreviewTitleAlignItems>
            {handleCloseClick && (
              <CloseButton
                data-testid="preview-card-close-button"
                onClick={handleCloseClick}
              />
            )}
          </HeaderContainer>
          <DividerContainer color="gray" size="small" />
          {!isCollapsed && children}
        </Content>

        {actions && !isCollapsed && (
          <>
            <Divider />
            {actions}
          </>
        )}
      </Container>
    </div>
  );
};

export default BasePreviewCard;
