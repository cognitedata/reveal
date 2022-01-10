import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexColumn, sizes } from 'styles/layout';

export const SeismicHeaderWrapper = styled(FlexColumn)`
  max-height: 80vh;
  height: 1000px;
`;

export const SeismicDisplayContent = styled(FlexColumn)`
  flex-grow: 1;
  justify-content: center;
`;

export const ImageCompareDraggerContainer = styled.div`
  position: sticky;
  z-index: ${layers.IMAGE_COMPARE_DRAGGER};
  width: ${sizes.medium};
  height: ${sizes.medium};
  border-width: 1;
  border-style: solid;

  background-color: var(--cogs-white);
  border-color: var(--cogs-white);

  border-radius: 50%;
  top: 50%;

  &:hover {
    background: var(--cogs-greyscale-grey2);
    border-color: var(--cogs-greyscale-grey4);
  }
`;
