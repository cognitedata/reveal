import { ReactNode } from 'react';
import styled from 'styled-components';
import { Title } from '@cognite/cogs.js';

export type PageProps = {
  children: ReactNode;
  className?: string;
  title: string;
};

const Page = ({ children, className, title }: PageProps): JSX.Element => {
  return (
    <StyledPage className={className}>
      <Title level={3}>{title}</Title>
      <StyledPageContent>{children}</StyledPageContent>
    </StyledPage>
  );
};

const StyledPage = styled.div`
  padding: 24px 40px;
`;
const StyledPageContent = styled.div`
  margin-top: 40px;
`;

export default Page;
