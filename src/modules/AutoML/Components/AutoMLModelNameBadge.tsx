import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { ColorsObjectDetection } from 'src/constants/Colors';
import styled from 'styled-components';

export const AutoMLModelNameBadge = (props: {
  name?: string;
  disabled?: boolean;
  small?: boolean;
}) => {
  return (
    <Tooltip
      content={
        <span data-testid="text-content">
          {props?.name || 'Untitled model'}
        </span>
      }
    >
      <Button
        icon="Scan"
        size={props.small ? 'small' : 'default'}
        style={{
          backgroundColor: ColorsObjectDetection.backgroundColor,
          color: ColorsObjectDetection.color,
          overflow: 'Ellipsis',
        }}
        disabled={props.disabled}
      >
        <TitleContainer small={props.small}>
          {props?.name || 'Untitled model'}
        </TitleContainer>
      </Button>
    </Tooltip>
  );
};

const TitleContainer = styled.div<{ small: undefined | boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: ${(props) => (props.small ? '80px' : '100%')};
`;
