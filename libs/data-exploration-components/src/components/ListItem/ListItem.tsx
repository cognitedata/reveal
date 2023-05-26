import React from 'react';

import styled, { CSSProperties, css } from 'styled-components';

import { lightGrey } from '@data-exploration-components/utils';

import { Colors, Title } from '@cognite/cogs.js';

type WrapperProps = {
  selected?: boolean;
  bordered?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
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
}: ListItemProps) => (
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

const additionalStyles = ({ selected, isClickable }: WrapperProps) => {
  if (selected) {
    return css`
      background: ${Colors['decorative--blue--600']};
      color: ${Colors['decorative--blue--200']};

      &&:hover {
        background: ${Colors['decorative--blue--600']};
      }
    `;
  }
  if (!isClickable) {
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
  (props) => css`
    align-items: baseline;
    display: flex;
    flex-direction: row;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    transition: 0.3s all;
    border-bottom: ${props.bordered ? `1px solid ${lightGrey}` : 'inherit'};

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
