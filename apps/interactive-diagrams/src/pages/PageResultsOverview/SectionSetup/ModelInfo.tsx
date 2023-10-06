import React from 'react';

import styled from 'styled-components';

import { Colors, Icon, Body } from '@cognite/cogs.js';

const StyledModelInfo = styled.div<{ editable: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${Colors['decorative--grayscale--white']};
  border: 1px solid ${Colors['decorative--grayscale--400']};
  border-radius: 4px;
  box-sizing: border-box;
  padding: 4px 8px;
  line-height: 20px;
  margin-top: 4px;
  cursor: ${({ editable }) => (editable ? 'pointer' : 'default')};

  & > * {
    white-space: nowrap;
  }
`;

type Props = {
  children: React.ReactNode;
  editable: boolean;
  onClick: () => void;
  'data-cy'?: string;
};

export default function ModelInfo(props: Props): JSX.Element {
  const { editable, children, onClick } = props;

  const onSelectionClick = () => {
    if (editable) onClick();
  };

  return (
    <StyledModelInfo
      editable={editable}
      onClick={onSelectionClick}
      data-cy={props['data-cy']}
    >
      <Body level={2} strong>
        {children}
      </Body>
      {editable && (
        <Icon
          type="Edit"
          css={{
            marginLeft: '6px',
          }}
        />
      )}
    </StyledModelInfo>
  );
}
