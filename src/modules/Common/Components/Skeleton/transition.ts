import { keyframes, css } from 'styled-components/macro';

export const DURATION = {
  FAST: '200ms',
  MEDIUM: '300ms',
  SLOW: '400ms',
};

const fadeInKeyframes = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOutKeyframes = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

/*
 * Plays the animation once and stops at the end
 */
export const notLooped = css`
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
  animation-iteration-count: 1;
`;

/*
 * Loops the animation
 */
export const Looped = css`
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
`;

/*
 * When the animation finishes, it plays again but backwards.
 */
// const boomerang = css`
//   animation-timing-function: ease-in-out;
//   animation-fill-mode: alternate;
//   animation-iteration-count: infinite;
// `;

/**
 * Fade animations
 */
export const FadeIn = css`
  ${notLooped};
  opacity: 0;
  animation-name: ${fadeInKeyframes};
`;

export const FadeInFast = (delay?: number) => css`
  ${FadeIn};
  animation-duration: ${DURATION.FAST};
  animation-delay: ${delay ? `${delay}ms` : 'none'};
`;

export const FadeInMedium = (delay?: number) => css`
  ${FadeIn};
  animation-duration: ${DURATION.MEDIUM};
  animation-delay: ${delay ? `${delay}ms` : 'none'};
`;

export const FadeOut = css`
  ${notLooped};
  opacity: 1;
  animation-name: ${fadeOutKeyframes};
`;
