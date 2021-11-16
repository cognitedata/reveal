import styled from 'styled-components';
import layers from 'utils/zIndex';

export const StickyTableHeadContainer = styled.div`
  height: 100%;
  width: 100%;

  thead {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: ${layers.MAXIMUM};
    box-shadow: inset 0 1px 0 var(--cogs-greyscale-grey2),
      inset 0 -1px 0 var(--cogs-greyscale-grey2);
  }
`;
