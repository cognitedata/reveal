import React from 'react';

import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import BreadcrumbItem, { BreadcrumbItemProps } from './BreadcrumbItem';

type BreadcrumbProps = {
  isFillingSpace?: boolean;
  items: Pick<BreadcrumbItemProps, 'path' | 'title'>[];
};

const StyledBreadcrumbWrapper = styled.div<{ $isFillingSpace?: boolean }>`
  border-bottom: ${({ $isFillingSpace }) =>
    $isFillingSpace && `1px solid ${Colors['border-default']}`};
  padding: ${({ $isFillingSpace }) => $isFillingSpace && '14px 42px'};
`;

const StyledBreadcrumbContent = styled.div`
  display: flex;
  line-height: 20px;
`;

const StyledBreadcrumbSeparator = styled.div`
  color: ${Colors['text-hint']};
  margin: 0 10px;
`;

const Breadcrumb = ({
  isFillingSpace,
  items,
}: BreadcrumbProps): JSX.Element => {
  const mergedItems = [
    {
      path: '/',
      title: 'Fusion',
    },
    ...items,
  ];

  return (
    <StyledBreadcrumbWrapper $isFillingSpace={isFillingSpace}>
      <StyledBreadcrumbContent>
        {mergedItems.map((breadcrumbProps, index) => {
          const isLastChild = index === mergedItems.length - 1;
          return (
            <React.Fragment key={breadcrumbProps.title}>
              <BreadcrumbItem isLastChild={isLastChild} {...breadcrumbProps} />
              {!isLastChild && (
                <StyledBreadcrumbSeparator>/</StyledBreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </StyledBreadcrumbContent>
    </StyledBreadcrumbWrapper>
  );
};

export default Breadcrumb;
