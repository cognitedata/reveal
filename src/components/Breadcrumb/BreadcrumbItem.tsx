import React from 'react';
import { Link } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';

export type BreadcrumbItemProps = {
  isLastChild?: boolean;
  path?: string;
  title: string;
};

const BreadcrumbItemStyles = ({ $isLastChild }: { $isLastChild?: boolean }) =>
  css`
    color: ${$isLastChild
      ? Colors['text-color']
      : Colors['text-color-secondary']};
    font-weight: ${$isLastChild ? 500 : 400};
  `;

const StyledBreadcrumItemLink = styled(Link)<{ $isLastChild?: boolean }>`
  && {
    ${({ $isLastChild }) => BreadcrumbItemStyles({ $isLastChild })};

    :hover {
      color: ${Colors.primary};
    }
  }
`;

const StyledBreadcrumbItemText = styled.div<{ $isLastChild?: boolean }>`
  ${({ $isLastChild }) => BreadcrumbItemStyles({ $isLastChild })};
`;

const BreadcrumbItem = ({
  isLastChild,
  path,
  title,
}: BreadcrumbItemProps): JSX.Element => {
  return path ? (
    <StyledBreadcrumItemLink
      aria-label="Breadcrumb link"
      $isLastChild={isLastChild}
      to={createLink(path)}
    >
      {title}
    </StyledBreadcrumItemLink>
  ) : (
    <StyledBreadcrumbItemText $isLastChild={isLastChild}>
      {title}
    </StyledBreadcrumbItemText>
  );
};

export default BreadcrumbItem;
