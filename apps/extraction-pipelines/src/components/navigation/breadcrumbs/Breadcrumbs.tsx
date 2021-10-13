import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { NavLink } from 'react-router-dom';

export const greyscaleGrey = (n: number) => Colors[`greyscale-grey${n}`].hex();
const BreadcrumbsWrapper = styled.nav`
  grid-area: breadcrumbs;
  padding: 0.875rem 2rem;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${greyscaleGrey(3)};
  ol {
    margin: 0;
    padding-left: 0;
    list-style: none;
    li {
      display: inline;
      + li::before {
        display: inline-block;
        margin: 0 0.1rem 0 0.3rem;
        color: ${greyscaleGrey(6)};
        content: '/\\00a0';
      }
      a {
        color: ${greyscaleGrey(6)};
        &:hover {
          text-decoration: underline;
        }
        &.active {
          color: ${greyscaleGrey(10)};
        }
      }
    }
  }
`;
interface Breadcrumb {
  href: string;
  label?: string;
  params?: string;
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
        {breadcrumbs.map(({ href, label, params }) => {
          return (
            <li key={href}>
              <NavLink
                to={{
                  pathname: href,
                  search: params,
                }}
                isActive={(match, linkLoc) => {
                  return href.includes(linkLoc.pathname);
                }}
              >
                {label}
              </NavLink>
            </li>
          );
        })}
      </ol>
      {rightSide}
    </BreadcrumbsWrapper>
  );
};
