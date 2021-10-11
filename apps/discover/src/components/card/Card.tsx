import React, { ReactNode } from 'react';

import styled from 'styled-components/macro';

import { Avatar } from '@cognite/cogs.js';

import { FlexGrow, FlexColumn, FlexRow, Ellipsis } from 'styles/layout';

const CardWrapper = styled(FlexColumn)`
  background-color: var(--cogs-white);
`;

const CardHeader = styled(FlexRow)`
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  border-bottom: 2px solid var(--cogs-greyscale-grey3);
`;

const HeaderLeft = styled(FlexRow)`
  overflow: hidden;
  flex: 1;
  padding: 12px 0 12px 18px;
  cursor: pointer;
`;

const AvatarWrapper = styled.div`
  width: 32px;
  height: 32px;
`;

const Title = styled.div`
  ${Ellipsis}

  flex:1;
  margin-left: 20px;
  font-weight: bold;
  font-size: 16px;
  position: relative;
  top: 4px;
`;

const CardContent = styled(FlexGrow)`
  padding: 12px 18px;
  cursor: pointer;
`;

const HeaderRight = styled(FlexRow)`
  flex-shrink: 0;
  margin-left: 12px;
  padding: 12px 18px 12px 0;
`;

interface Props {
  avatarText?: string;
  title?: string;
  text?: string;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
  clickHandler?: () => void;
  settings?: ReactNode;
}

export const Card: React.FC<Props> = ({
  avatarText,
  title,
  children,
  text,
  loading,
  className,
  clickHandler,
  settings,
  ...rest
}) => {
  return (
    <CardWrapper className={className} {...rest}>
      <CardHeader>
        <HeaderLeft onClick={clickHandler}>
          <AvatarWrapper>
            <Avatar text={title || ''} maxLength={2} />
          </AvatarWrapper>
          <Title>{title}</Title>
        </HeaderLeft>
        <HeaderRight>{settings}</HeaderRight>
      </CardHeader>
      <CardContent onClick={clickHandler}>
        {children}
        {text !== undefined && text}
      </CardContent>
    </CardWrapper>
  );
};
