import React, { ReactNode } from 'react';

import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

import { FlexGrow, FlexColumn, FlexRow, Ellipsis, sizes } from 'styles/layout';

const CardWrapper = styled(FlexColumn)`
  background-color: var(--cogs-white);
`;

const CardHeader = styled(FlexRow)`
  height: 68px;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  border-bottom: 2px solid var(--cogs-greyscale-grey3);
`;

const HeaderLeft = styled(FlexRow)`
  overflow: hidden;
  flex: 1;
  cursor: pointer;
`;

const AvatarWrapper = styled.div`
  width: 36px;
  height: 36px;
  background-color: #4cc96814;
  margin-left: ${sizes.normal};
  border-radius: 6px;
`;

const IconWrapper = styled(Icon)`
  margin: 11px 10px;
  color: #4cc968;
`;

const Title = styled.div`
  ${Ellipsis}

  flex:1;
  margin-left: 12px;
  font-weight: 600;
  font-size: ${sizes.normal};
  position: relative;
  top: ${sizes.small};
`;

const CardContent = styled(FlexGrow)`
  height: 202px;
  padding: 12px ${sizes.normal} 20px ${sizes.normal};
  cursor: pointer;
`;

const HeaderRight = styled(FlexRow)`
  flex-shrink: 0;
  margin-left: 12px;
`;

interface Props {
  title?: string;
  text?: string;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
  clickHandler?: () => void;
  settings?: ReactNode;
}

export const Card: React.FC<Props> = ({
  title,
  children,
  text,
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
            <IconWrapper type="FolderLine" />
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
