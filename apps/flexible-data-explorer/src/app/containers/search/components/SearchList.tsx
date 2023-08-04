import React, { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { Body, Detail, IconType } from '@cognite/cogs.js';

import { ExperimentalIndicator } from './ExperimentalIndicator';
import { SearchListItemIcon } from './SearchListItemIcon';

export const SearchList = ({
  children,
  ...rest
}: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => {
  return <SearchListContainer {...rest}>{children}</SearchListContainer>;
};

interface Props {
  title: string;
  subtitle?: string;
  icon?: IconType | 'AiSearch';
  description?: string;
  onClick?: () => void;
  focused?: boolean;
  experimental?: boolean;
  hideEnterIcon?: boolean;
}
export const SearchListItem = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      title,
      subtitle,
      icon,
      description,
      onClick,
      focused,
      experimental,
      hideEnterIcon,
    },
    ref
  ) => {
    return (
      <Container
        tabIndex={0}
        focused={focused}
        ref={ref}
        role="button"
        onClick={onClick}
      >
        <Content>
          <InfoContent>
            <SearchListItemIcon icon={icon} />
            <InfoTextContent>
              <Detail muted>{subtitle}</Detail>
              <Body strong level={4}>
                {title}
              </Body>
            </InfoTextContent>
          </InfoContent>
          <DescriptionContent>
            <DescriptionText level={6} muted>
              {description}
            </DescriptionText>
          </DescriptionContent>
          {experimental && <ExperimentalIndicator />}
          {!hideEnterIcon && <EnterIcon />}
        </Content>
      </Container>
    );
  }
);

SearchList.Item = SearchListItem;

const SearchListContainer = styled.div<{ hideShadow?: boolean }>`
  border-radius: 10px;
  padding: 8px 0;
  background: white;

  & > * {
    border-bottom: 1px solid #ebeef7;

    &:last-child {
      border-bottom: none;
    }
  }
`;

const EnterIcon = styled.div`
  align-self: center;

  &::after {
    content: '↵';
    position: relative;
    top: 0px;
    right: 0px;
    width: 30px;
    height: 30px;
  }
`;

const Container = styled.div<{ focused?: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #fff;
  cursor: pointer;

  ${({ focused }) => {
    if (focused) {
      return css`
        background: linear-gradient(
            0deg,
            rgba(59, 130, 246, 0.1),
            rgba(59, 130, 246, 0.1)
          ),
          rgba(255, 255, 255, 0.8);

        ${EnterIcon} {
          opacity: 1 !important;
        }
      `;
    }
  }}

  ${EnterIcon} {
    opacity: 0.3;
  }

  &:hover {
    background: linear-gradient(
        0deg,
        rgba(59, 130, 246, 0.1),
        rgba(59, 130, 246, 0.1)
      ),
      rgba(255, 255, 255, 0.8);
  }
`;

const Content = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 16px;
  gap: 8px;
`;

const InfoContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const InfoTextContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`;

const DescriptionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DescriptionText = styled(Body)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
