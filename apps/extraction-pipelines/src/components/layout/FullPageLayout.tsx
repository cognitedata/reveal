import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import { MainFullWidthGrid, PageTitle, PageWrapper } from 'components/styled';

interface LayoutProps {
  pageHeadingText: string;
  pageHeading?: ReactNode;
  headingSide?: ReactNode;
  breadcrumbs?: ReactNode;
  hideDividerLine?: boolean;
}

export const FullPageLayout: FunctionComponent<LayoutProps> = ({
  pageHeadingText,
  pageHeading,
  headingSide,
  breadcrumbs,
  hideDividerLine,
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
      <MainFullWidthGrid hideDividerLine={hideDividerLine}>
        {children}
      </MainFullWidthGrid>
    </PageWrapper>
  );
};
