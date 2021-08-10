import React from 'react';
import styled from 'styled-components';
import { Colors, Icon, Body } from '@cognite/cogs.js';

const StyledModelInfo = styled.div<{ editable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${Colors.white.hex()};
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  border-radius: 4px;
  box-sizing: border-box;
  padding: 4px 8px;
  line-height: 20px;
  margin-top: 4px;
  cursor: ${({ editable }) => (editable ? 'pointer' : 'default')};
`;

type Props = {
  children: React.ReactNode;
  editable: boolean;
  onClick: () => void;
};

export default function ModelInfo(props: Props): JSX.Element {
  const { editable, children, onClick } = props;

  const onSelectionClick = () => {
    if (editable) onClick();
  };

  return (
    <StyledModelInfo editable={editable} onClick={onSelectionClick}>
      <Body level={2} strong>
        {children}
      </Body>
      {editable && (
        <Icon
          type="Edit"
          style={{ color: Colors['greyscale-grey6'].hex(), marginLeft: '6px' }}
        />
      )}
    </StyledModelInfo>
  );
}
