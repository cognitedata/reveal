import styled from 'styled-components';

export const Container = styled.div`
  background-color: var(--cogs-bg-accent);
  border-bottom: 1px solid var(--cogs-border-default);
  padding: 14px 32px;
`;

export const Crumb = styled.span`
  color: var(--cogs-text-hint);

  &:after {
    content: '/';
    display: inline;
    padding: 0 8px;
  }

  &:last-child {
    color: inherit;

    &:after {
      display: none;
    }
  }
`;

export const SkeletonContainer = styled.span`
  width: 124px;
  display: inline-block;
  vertical-align: middle;
  line-height: 0;
`;
