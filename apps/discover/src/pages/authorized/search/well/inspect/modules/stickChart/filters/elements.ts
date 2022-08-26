import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

import { FlexRow, sizes } from 'styles/layout';

export const FilterItemWrapper = styled(FlexRow)`
  padding: 2px 12px;
  align-items: center;
  gap: ${sizes.small};

  background: rgba(102, 102, 102, 0.06);
  border-radius: 6px;
  margin-right: ${sizes.small};
`;

export const FilterBarWrapper = styled(FlexRow)`
  gap: ${sizes.small};
  margin-bottom: ${sizes.normal};
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
