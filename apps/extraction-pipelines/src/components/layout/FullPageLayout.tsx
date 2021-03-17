import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { PageWrapper, GridBreadCrumbsWrapper } from 'styles/StyledPage';
import { MainFullWidthGrid } from 'styles/grid/StyledGrid';
import { PageTitle } from 'styles/StyledHeadings';

interface LayoutProps {
  pageHeadingText: string;
  headingSide?: ReactNode;
  link?: { path: string; text: string };
}

export const FullPageLayout: FunctionComponent<LayoutProps> = ({
  pageHeadingText,
  headingSide,
  link,
  children,
}: PropsWithChildren<LayoutProps>) => {
  return (
    <PageWrapper>
      {link && (
        <GridBreadCrumbsWrapper to={createLink(link.path)}>
          {link.text}
        </GridBreadCrumbsWrapper>
      )}
      <PageTitle>{pageHeadingText}</PageTitle>
      {headingSide}
      <MainFullWidthGrid>{children}</MainFullWidthGrid>
    </PageWrapper>
  );
};
