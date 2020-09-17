import styled, { CSSProperties, css } from 'styled-components';
import { Colors, Title } from '@cognite/cogs.js';
import React from 'react';

type WrapperProps = {
  selected?: boolean;
  bordered?: boolean;
  isClickable?: boolean;
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
  onClick,
}: ListItemProps) => {
  return (
    <ListItemWrapper
      id={id}
      selected={selected}
      bordered={bordered}
      onClick={onClick}
      isClickable={!!onClick}
      style={style}
    >
      {title && (
        <Title level={6} className="list-title">
          {title}
        </Title>
      )}
      {children}
    </ListItemWrapper>
  );
};

const additionalStyles = (props: WrapperProps) => {
  if (props.selected) {
    return css`
      background: ${Colors['midblue-6'].hex()};
      color: ${Colors['midblue-2'].hex()};

      &&:hover {
        background: ${Colors['midblue-6'].hex()};
      }
    `;
  }
  if (!props.isClickable) {
    return css`
      cursor: default;
    `;
  }
  return `
    background: inherit;
    color: inherit;

    &&:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  `;
};

export const ListItemWrapper = styled.div<WrapperProps>(
  props => css`
    align-items: baseline;
    display: flex;
    flex-direction: row;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    transition: 0.3s all;
    border-bottom: ${props.bordered
      ? `1px solid ${Colors['greyscale-grey3'].hex()}`
      : 'inherit'};

    p {
      margin-bottom: 0px;
    }

    .list-title {
      align-self: stretch;
      flex: 1;
    }

    ${additionalStyles(props)}
  `
);
