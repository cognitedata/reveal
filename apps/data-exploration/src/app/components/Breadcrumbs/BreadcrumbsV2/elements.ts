import styled from 'styled-components';

export const BreadcrumbItemWrapper = styled.div`
  display: flex;
  align-items: center;

  &:hover {
    cursor: pointer;
  }
`;

export const BreadcrumbsWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 36px;
  padding-left: 16px;
  overflow-x: auto;
  background: var(--cogs-surface--medium);
`;
