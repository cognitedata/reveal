import React from 'react';

import styled from 'styled-components';

import { Colors, Tooltip } from '@cognite/cogs.js';

import { truncateString } from '../../../utils/utils';

interface BadgeProps {
  text: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const StyledBadge = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 2px solid ${Colors['decorative--grayscale--300']};
  border-radius: 5px;
  padding: 3px;
  margin: 3px;
  white-space: nowrap;

  svg {
    margin-right: 3px;
  }
`;

export const Badge = (props: BadgeProps) => {
  const { text, icon, style } = props;
  const shortenedText = truncateString(text, 10);

  return shortenedText !== text ? (
    <Tooltip content={text}>
      <StyledBadge style={style}>
        {icon}
        {shortenedText}
      </StyledBadge>
    </Tooltip>
  ) : (
    <StyledBadge style={style}>
      {icon}
      {shortenedText}
    </StyledBadge>
  );
};
