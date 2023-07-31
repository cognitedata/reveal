import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

import { FlexColumn, sizes } from 'styles/layout';

export const FilterWrapper = styled(FlexColumn)`
  align-items: center;
  justify-content: flex-start;
`;

export const FilterContainer = styled.div`
  padding-top: ${sizes.large};
  margin-bottom: ${sizes.medium};
`;

export const Category = styled.div`
  align-items: center;
  display: flex;
  padding-top: ${sizes.small};
`;

export const SearchInputContainer = styled(Category)`
  justify-content: center;
  flex-wrap: wrap;
`;

export const ValueContainer = styled.div`
  position: relative;
  top: 2px;
  background: var(--cogs-greyscale-grey2);
  padding: 3px 7px 4px 10px;
  margin-left: 4px;
  margin-bottom: 4px;
  border-radius: 15px;
  cursor: default;
`;

export const RemoveValue = styled(Icon).attrs(() => ({
  type: 'Close',
  size: 18,
  role: 'button',
}))`
  cursor: pointer;
  border-radius: 100%;
  padding: 4px;
  transition: color 0.15s, background-color 0.15s;
  margin-left: 6px;

  &:hover {
    color: var(--cogs-black);
    background-color: var(--cogs-greyscale-grey4);
  }
`;

export const ValueSpan = styled.span`
  position: relative;
  bottom: 1px;
  color: var(--cogs-black);
  font-size: 12px;
`;

export const Title = styled.span`
  font-weight: bold;
`;

export const CategoryContainer = styled(FlexColumn)`
  align-items: center;
  justify-content: center;
  max-width: 80%;
  margin: 0 auto;
`;
