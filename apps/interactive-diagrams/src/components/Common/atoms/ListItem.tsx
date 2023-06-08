import React from 'react';

import styled, { CSSProperties } from 'styled-components';

import { Colors } from '@cognite/cogs.js';

type WrapperProps = {
  selected?: boolean;
  bordered?: boolean;
};

export type ListItemProps = {
  id?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
} & WrapperProps;

export const ListItem = ({
  title,
  children,
  selected,
  bordered,
  style,
  id,
  onClick = () => {},
}: ListItemProps) => {
  return (
    <ListItemWrapper
      id={id}
      selected={selected}
      bordered={bordered}
      onClick={onClick}
      style={style}
    >
      {title && (
        <div className="title">
          <strong>{title}</strong>
        </div>
      )}
      {children}
    </ListItemWrapper>
  );
};

export const ListItemWrapper = styled.div<WrapperProps>`
  align-items: baseline;
  display: flex;
  flex-direction: row;
  border-radius: 4px;
  padding: 12px 24px;
  cursor: pointer;
  transition: 0.3s all;

  p {
    margin-bottom: 0px;
  }
  background: ${(props) =>
    props.selected ? Colors['decorative--blue--600'] : 'inherit'};
  color: ${(props) =>
    props.selected ? Colors['decorative--blue--200'] : 'inherit'};
  border-bottom: ${(props) =>
    props.bordered
      ? `1px solid ${Colors['decorative--grayscale--300']}`
      : 'inherit'};

  .title {
    flex: 1;
  }

  &&:hover {
    background: ${(props) =>
      props.selected ? Colors['decorative--blue--600'] : 'rgba(0,0,0,0.05)'};
  }
`;
