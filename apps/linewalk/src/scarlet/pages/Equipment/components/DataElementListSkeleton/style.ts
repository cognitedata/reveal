import { Skeleton } from '@cognite/cogs.js';
import styled from 'styled-components';

export const DataElementSkeleton = styled(Skeleton.Rectangle)`
  animation: none;
  background-color: var(--cogs-greyscale-grey3);
  background-image: none;
`;
