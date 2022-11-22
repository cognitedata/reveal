import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { NavLink } from 'react-router-dom';
import { PAGE_MARGIN } from 'components/styled';

interface Breadcrumb {
  href?: string;
  label: string;
  dataTestId?: string;
}
interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  rightSide?: React.ReactNode;
}

export const Breadcrumbs: FunctionComponent<BreadcrumbsProps> = ({
  breadcrumbs,
  rightSide,
}: PropsWithChildren<BreadcrumbsProps>) => {
  return (
    <BreadcrumbsWrapper aria-label="Breadcrumb">
      <ol>
        {breadcrumbs.map(({ href, label, dataTestId }) => {
          if (href) {
            return (
              <li key={href} data-testid={dataTestId}>
                <NavLink to={href}>{label}</NavLink>
              </li>
            );
          }
          return (
            <li key={href} data-testid={dataTestId}>
              {label}
            </li>
          );
        })}
      </ol>
      {rightSide}
    </BreadcrumbsWrapper>
  );
};

const BreadcrumbsWrapper = styled.nav`
  grid-area: breadcrumbs;
  padding: 0.875rem ${PAGE_MARGIN};
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  background-color: white;
  ol {
    margin: 0;
    padding-left: 0;
    list-style: none;
    li {
      display: inline;
      + li::before {
        display: inline-block;
        margin: 0 0.1rem 0 0.3rem;
        color: ${Colors['greyscale-grey6'].hex()};
        content: '/\\00a0';
      }
      a {
        color: ${Colors['greyscale-grey6'].hex()};
        &:hover {
          text-decoration: underline;
        }
        &.active {
          color: ${Colors['greyscale-grey10'].hex()};
        }
      }
    }
  }
`;
