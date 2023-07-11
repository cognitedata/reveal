import * as React from 'react';
import { useRef } from 'react';

import { Icon, IconType } from '@cognite/cogs.js';

import { useIsOverflow } from '../../../../hooks/useIsOverflow';

import {
  Content,
  Subtitle,
  TextContent,
  Title,
  SubtitleTooltipWrapper,
  SubtitleTooltip,
} from './elements';

const TEXT_CONTENT_WIDTH = 200;
const ICON_WIDTH = 24;

export interface MenuItemProps {
  title: string;
  subtitle?: string;
  icon?: IconType;
  onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  icon,
  onClick,
}) => {
  const subtitleWrapperRef = useRef<HTMLDivElement>(null);

  const isSubtitleOverflow = useIsOverflow(subtitleWrapperRef);

  const textContentWidth = icon
    ? TEXT_CONTENT_WIDTH - ICON_WIDTH
    : TEXT_CONTENT_WIDTH;

  return (
    <Content onClick={() => onClick?.()}>
      {icon && <Icon type={icon} />}

      <TextContent width={textContentWidth}>
        <Title>{title}</Title>

        {subtitle && (
          <SubtitleTooltipWrapper ref={subtitleWrapperRef}>
            <SubtitleTooltip
              placement="top-start"
              key={subtitle}
              content={subtitle}
              arrow={false}
              disabled={!isSubtitleOverflow}
              left={icon && -ICON_WIDTH}
            >
              <Subtitle>{subtitle}</Subtitle>
            </SubtitleTooltip>
          </SubtitleTooltipWrapper>
        )}
      </TextContent>

      <Icon type="ChevronRight" />
    </Content>
  );
};
