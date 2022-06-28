import { Title } from '@cognite/cogs.js';
import { CSSProperties } from 'react';
import * as React from 'react';
import styled from 'styled-components';

interface Props {
  title?: string;
  children: React.ReactNode;
  style?: CSSProperties;
}

const RoundedBox = styled.div`
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 6px;
  margin: 8px 0;
`;

const MainDiv = styled.div`
  margin: 8px 0;
`;

const DetailsBlock = ({ title, children, ...props }: Props) => (
  <MainDiv {...props}>
    {title && <Title level={6}>{title}</Title>}
    <RoundedBox>
      {children || (
        <div style={{ padding: '0.5rem 1rem' }}>No info to display</div>
      )}
    </RoundedBox>
  </MainDiv>
);

export default DetailsBlock;
