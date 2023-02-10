import styled from 'styled-components/macro';

import { Icon, Label } from '@cognite/cogs.js';

import { Center, FlexRow, sizes } from 'styles/layout';

export const FilterItemWrapper = styled(FlexRow)`
  height: 36px;
  padding: 0 12px;
  align-items: center;
  gap: ${sizes.small};

  background: rgba(102, 102, 102, 0.06);
  border-radius: 6px;
  margin-right: ${sizes.small};
`;

export const FilterBarWrapper = styled(FlexRow)`
  gap: ${sizes.small};
  padding-bottom: ${sizes.normal};
  overflow-x: auto;
`;

export const VertSeperator = styled.div`
  display: flex;
  border-right: 1px solid var(--cogs-border--muted);
  height: 50%;
  margin-left: 4px;
`;

export const DragHandler = styled(Icon)`
  margin-right: 2px;
`;

export const ColumnName = styled.span`
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.9);
`;

export const DropDownIconStyler = styled.div`
  margin-left: -${sizes.small};
  margin-right: -${sizes.small};
  & > * span.cogs-label {
    border: none !important;
    background: rgba(102, 102, 102, 0) !important;
  }
  & > * i.cogs-icon {
    color: rgba(0, 0, 0, 0.7) !important;
  }
`;

export const MultiSelectIconWrapper = styled(Label)`
  cursor: pointer;
`;

export const MultiSelectWrapper = styled.div`
  .cogs-select__control {
    display: none;
  }
  .cogs-select__menu {
    margin-top: 2px;
    padding: ${sizes.small};

    .cogs-select__option {
      padding-left: ${sizes.small};
      padding-right: ${sizes.small};
    }
  }
`;

export const FooterWrapper = styled.div`
  border-top: 2px solid var(--cogs-greyscale-grey4);
  padding-top: 6px;
  margin-top: ${sizes.extraSmall};
`;

export const UnifyScalesSwitchWrapper = styled(Center)`
  padding: ${sizes.small};
  padding-right: 0;
  margin-top: ${sizes.extraSmall};
`;

export const UnifyScalesLabel = styled.div`
  display: flex;
  width: 100%;
  padding-right: ${sizes.normal};
  margin-top: 2px;
`;
