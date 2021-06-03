import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import { PageWrapper } from 'styles/StyledPage';
import { MainFullWidthGrid } from 'styles/grid/StyledGrid';
import { PageTitle } from 'styles/StyledHeadings';

interface LayoutProps {
  pageHeadingText: string;
  pageHeading?: ReactNode;
  headingSide?: ReactNode;
  breadcrumbs?: ReactNode;
}

export const FullPageLayout: FunctionComponent<LayoutProps> = ({
  pageHeadingText,
  pageHeading,
  headingSide,
  breadcrumbs,
  children,
}: PropsWithChildren<LayoutProps>) => {
  const renderHeading = () => {
    if (pageHeading) {
      return <>{pageHeading}</>;
    }
    return <PageTitle>{pageHeadingText}</PageTitle>;
  };
  return (
    <PageWrapper>
      {breadcrumbs}
      {renderHeading()}
      {headingSide}
      <MainFullWidthGrid>{children}</MainFullWidthGrid>
    </PageWrapper>
  );
};
