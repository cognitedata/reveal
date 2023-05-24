import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { createLink } from '../../utils';

export type BreadcrumbItemProps = {
  isLastChild?: boolean;
  path?: string;
  title: string;
};

const BreadcrumbItemStyles = ({ $isLastChild }: { $isLastChild?: boolean }) =>
  css`
    /* TODO: convert to cogs color once they are added - text_icon/medium, text_icon/strong */
    color: ${$isLastChild ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)'};
    font-feature-settings: 'cv08' on, 'ss04' on;
  `;

// https://github.com/styled-components/styled-components/issues/1449#issuecomment-420087359
const StyledBreadcrumItemLink = styled((props) => <Link {...props} />)<{
  $isLastChild?: boolean;
}>`
  && {
    ${({ $isLastChild }) => BreadcrumbItemStyles({ $isLastChild })};

    :hover {
      /* TODO: convert to cogs color once it is added - text_icon/interactive-hover */
      color: rgba(66, 85, 187, 1);
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
    <StyledBreadcrumItemLink $isLastChild={isLastChild} to={createLink(path)}>
      {title}
    </StyledBreadcrumItemLink>
  ) : (
    <StyledBreadcrumbItemText $isLastChild={isLastChild}>
      {title}
    </StyledBreadcrumbItemText>
  );
};

export default BreadcrumbItem;
