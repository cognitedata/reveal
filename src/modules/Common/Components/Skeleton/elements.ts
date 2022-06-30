import styled, { keyframes } from 'styled-components/macro';
import { RectangleProps, CircleProps } from './types';
import { Looped } from './transition';

const gradientSize = '640px';

const skeletonLoaderKeyframes = keyframes`
  from { background-position: -${gradientSize} 0; }
  to { background-position: ${gradientSize} 0; }
`;

const Base = styled.div`
  ${Looped};
  display: inline-block;
  animation-duration: 3s;
  animation-name: ${skeletonLoaderKeyframes};
  background-image: linear-gradient(
    to right,
    var(--cogs-greyscale-grey3) 0%,
    var(--cogs-greyscale-grey1) 20%,
    var(--cogs-greyscale-grey3) 40%
  );
  background-size: ${gradientSize} ${gradientSize};
`;

export const Rectangle = styled(Base)`
  height: ${(props: RectangleProps) => props.height || '1em'};
  width: ${(props: RectangleProps) => props.width || '100%'};

  border-radius: 4px;

  // We generally use 140% (1.4em) line height.
  // That's 0.2em spacing on the top and bottom,
  // and 1em for the text itself.
  margin: 0.2em 0;
  min-height: 1em;
`;

export const Circle = styled(Rectangle)`
  height: ${(props: CircleProps) => props.diameter || '3em'};
  width: ${(props: CircleProps) => props.diameter || '3em'};

  // This way we can prevent using % in the border-radius as that could
  // make it oval.
  border-radius: ${(props: CircleProps) => props.diameter || '3em'}; ;
`;
