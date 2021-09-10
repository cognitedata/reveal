import React from 'react';
import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';

const Wrapper = styled.div.attrs(
  ({ style }: { style: React.CSSProperties }) => ({ style })
)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: ${Colors['midblue-7'].hex()};
  color: ${Colors['midblue-2'].hex()};
  border-radius: 4px;
`;

type InfoFieldProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function InfoField(props: InfoFieldProps) {
  const { children, style = {} } = props;
  return (
    <Wrapper style={style}>
      <Icon
        type="Info"
        size={16}
        style={{
          marginRight: '16px',
          minWidth: '16px',
          minHeight: '16px',
          width: '16px',
          height: '16px',
        }}
      />
      {children}
    </Wrapper>
  );
}
