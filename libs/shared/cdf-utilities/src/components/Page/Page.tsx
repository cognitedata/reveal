import React, { ReactNode } from 'react';
import styled from 'styled-components';

import PageHeader, { PageHeaderProps } from '../PageHeader/PageHeader';

export type PageProps = {
  children: ReactNode;
  className?: string;
} & PageHeaderProps;

const Page = ({
  breadcrumbItems,
  children,
  className,
  title,
}: PageProps): JSX.Element => {
  return (
    <div className={className}>
      <PageHeader breadcrumbItems={breadcrumbItems} title={title} />
      <StyledPageContent>{children}</StyledPageContent>
    </div>
  );
};

const StyledPageContent = styled.div`
  padding: 24px 40px;
`;

export default Page;
