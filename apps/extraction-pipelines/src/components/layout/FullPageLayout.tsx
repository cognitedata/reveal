import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { PageWrapper, GridBreadCrumbsWrapper } from 'styles/StyledPage';
import { MainFullWidthGrid } from 'styles/grid/StyledGrid';
import { PageTitle } from 'styles/StyledHeadings';

interface LayoutProps {
  pageHeadingText: string;
  pageHeading?: ReactNode;
  headingSide?: ReactNode;
  link?: { path: string; text: string };
}

export const FullPageLayout: FunctionComponent<LayoutProps> = ({
  pageHeadingText,
  pageHeading,
  headingSide,
  link,
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
      {link && (
        <GridBreadCrumbsWrapper to={createLink(link.path)}>
          {link.text}
        </GridBreadCrumbsWrapper>
      )}
      {renderHeading()}
      {headingSide}
      <MainFullWidthGrid>{children}</MainFullWidthGrid>
    </PageWrapper>
  );
};
