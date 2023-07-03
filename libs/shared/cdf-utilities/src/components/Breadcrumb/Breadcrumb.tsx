import React from 'react';

import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import BreadcrumbItem, { BreadcrumbItemProps } from './BreadcrumbItem';

export type BreadcrumbProps = {
  className?: string;
  extraContent?: React.ReactNode;
  items: Pick<BreadcrumbItemProps, 'path' | 'title'>[];
};

const StyledBreadcrumbContainer = styled.div`
  align-items: center;
  display: flex;
  line-height: 20px;
`;

const StyledBreadcrumbSeparator = styled(Icon).attrs({
  type: 'ChevronRightSmall',
})`
  /* TODO: convert to cogs color once it is added - text_icon/strong */
  color: rgba(0, 0, 0, 0.7);
  margin: 0 4px;
`;

const StyledExtraContentWrapper = styled.div`
  height: 20px;
  margin-left: auto;
`;

export const Breadcrumb = ({
  className,
  extraContent,
  items,
}: BreadcrumbProps) => {
  const mergedItems = [
    {
      path: '/',
      title: 'Cognite Data Fusion',
    },
    ...items,
  ];

  return (
    <StyledBreadcrumbContainer className={className}>
      {mergedItems.map((breadcrumbProps, index) => {
        const isLastChild = index === mergedItems.length - 1;
        return (
          <React.Fragment key={breadcrumbProps.title}>
            <BreadcrumbItem
              isLastChild={isLastChild}
              path={breadcrumbProps.path}
              title={breadcrumbProps.title}
            />
            {!isLastChild && <StyledBreadcrumbSeparator />}
          </React.Fragment>
        );
      })}
      {extraContent && (
        <StyledExtraContentWrapper>{extraContent}</StyledExtraContentWrapper>
      )}
    </StyledBreadcrumbContainer>
  );
};
