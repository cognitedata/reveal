import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Paper } from 'components/paper';

export const SelectListWrapper = styled(Paper)`
  min-width: 160px;
  position: absolute;
  margin-top: 8px;
  padding: 8px !important;
  background-color: var(--cogs-white);
  z-index: ${layers.DROPDOWN_SELECT};
  & > * ul {
    padding: 0;
    margin-bottom: 0;
  }
`;

export const SelectListItem = styled.li`
  margin-bottom: 4px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: var(--cogs-greyscale-grey4);
  }
  background-color: ${(props: { selected: boolean }) =>
    props.selected && 'var(--cogs-greyscale-grey3)'};
`;
