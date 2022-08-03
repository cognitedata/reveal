import styled from 'styled-components/macro';

import { FlexRow, sizes } from 'styles/layout';

import { FilterItem } from './FilterItem';

export const FilterItemWrapper = styled(FlexRow)`
  padding: ${sizes.small};
  align-items: center;
  padding: 8px 8px 8px 12px;
  gap: 8px;

  background: rgba(102, 102, 102, 0.06);
  border-radius: 6px;
  margin-right: 8px;
`;

export const FilterItemElement = styled.div`
  padding-left: ${sizes.extraSmall};
  padding-right: ${sizes.extraSmall};
`;

export const FilterBarWrapper = styled(FlexRow)`
  gap: ${sizes.small};
  margin-bottom: ${sizes.normal};
`;

export const FilterText = styled.div`
  color: var(--cogs-text-icon--strong);
`;

export const VertSeperator = styled.div`
  display: flex;
  border-right: 1px solid var(--cogs-color-strokes-default);
  height: 100%;
  margin: 0 14px;
`;

export const NptFilterItemContainer = styled(FilterItem)`
  & > * .cogs-menu {
    width: 175px;
  }
`;
