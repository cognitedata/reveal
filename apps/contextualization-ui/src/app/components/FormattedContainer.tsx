import styled from 'styled-components';

import { Title } from '@cognite/cogs.js';

import { SectionDivider } from '../components/SectionDivider';

export const FormattedContainer = ({
  title,
  body,
  footer,
}: {
  title?: string | JSX.Element;
  body?: JSX.Element;
  footer?: JSX.Element;
}) => {
  return (
    <Container>
      <TitleWrapper>
        <Title level={6}>{title}</Title>
      </TitleWrapper>
      <SectionDivider />
      <BodyWrapper>{body}</BodyWrapper>
      <SectionDivider />
      <FooterWrapper>{footer}</FooterWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
`;

const TitleWrapper = styled.div`
  min-height: 20px;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
`;

const FooterWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-self: end;
  gap: 10px;
  min-height: 38px;
`;
