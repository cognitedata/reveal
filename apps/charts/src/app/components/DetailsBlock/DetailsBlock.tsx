import { Title } from '@cognite/cogs.js';
import { CSSProperties, FC } from 'react';
import * as React from 'react';
import styled from 'styled-components';

interface DetailsBlockProps {
  title: string;
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

const DetailsBlock: FC<DetailsBlockProps> = ({ title, children, ...props }) => (
  <MainDiv {...props}>
    <Title level={6}>{title}</Title>
    <RoundedBox>{children || 'No info to display'}</RoundedBox>
  </MainDiv>
);

export default DetailsBlock;
