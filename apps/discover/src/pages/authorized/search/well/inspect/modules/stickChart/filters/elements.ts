import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

import { FlexRow, sizes } from 'styles/layout';

import { FilterItem } from './FilterItem';

export const FilterItemWrapper = styled(FlexRow)`
  padding: ${sizes.small};
  align-items: center;
  padding: ${sizes.small};
  gap: ${sizes.small};

  background: rgba(102, 102, 102, 0.06);
  border-radius: 6px;
  margin-right: ${sizes.small};
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
  border-right: 1px solid var(--cogs-border--muted);
  height: 100%;
`;

export const NptFilterItemContainer = styled(FilterItem)`
  & > * .cogs-menu {
    width: 175px;
  }
`;

export const DragHandler = styled(Icon)`
  margin-top: 5px;
`;

export const DropDownIconStyler = styled.div`
  & > * span.cogs-label {
    border: none !important;
    background: rgba(102, 102, 102, 0) !important;
  }
  & > * i.cogs-icon {
    color: rgba(0, 0, 0, 0.7) !important;
  }
`;
