import styled from 'styled-components';

export const NullViewWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding: 7em 0;

  &.in-list {
    padding: 1em 0;
  }
`;

export const InnerWrapper = styled.div`
  text-align: center;
  padding: 1em;

  &.absolute-centered {
    position: absolute;
    top: 46%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .cogs-graphic {
    margin: 0 auto 1em auto;
    height: auto !important;
  }

  h2 {
    line-height: 1.3;
  }

  p {
    color: var(--cogs-greyscale-grey6);
    font-weight: 600;
  }
`;
