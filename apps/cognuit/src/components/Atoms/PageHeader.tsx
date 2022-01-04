import { Body, Title } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 54px;
  margin-bottom: 32px;
  margin-left: 16px;
  margin-right: 16px;
`;

const Subtitle = styled(Body)`
  color: rgba(0, 0, 0, 0.45);
`;

interface Props {
  title: string;
  titleLevel?: number;
  subtitle?: string;
}

export const PageHeader: React.FC<Props> = ({
  title,
  subtitle,
  titleLevel,
}) => {
  return (
    <Container>
      <Title level={titleLevel || 2}>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Container>
  );
};

export const PageSubHeader: React.FC<Props> = ({ ...rest }) => {
  return <PageHeader titleLevel={4} {...rest} />;
};
