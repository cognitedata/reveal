import styled from 'styled-components';
import z from 'utils/z';

export const ShapeSettingsWrapper = styled.div`
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: ${z.OVERLAY};
  margin-left: 37px;

  .cogs-menu {
    border-radius: 4px;
    padding-bottom: 8px;
  }

  &.expanded {
    left: 386px;
  }
`;
