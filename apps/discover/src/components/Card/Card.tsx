import React, { ReactNode } from 'react';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';

import {
  AvatarWrapper,
  CardContent,
  CardHeader,
  CardWrapper,
  HeaderLeft,
  HeaderRight,
  IconWrapper,
  Title,
} from './element';

interface Props {
  title: string;
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
            <IconWrapper type="Folder" />
          </AvatarWrapper>
          <Title>
            <MiddleEllipsis value={title} fixedLength={30} />
          </Title>
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
