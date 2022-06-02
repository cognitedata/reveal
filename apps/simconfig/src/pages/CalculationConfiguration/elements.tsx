import styled from 'styled-components/macro';

import { Colors, Icon } from '@cognite/cogs.js';

export const LoaderOverlay = styled(Icon).attrs((props) => ({
  ...props,
  type: 'Loader',
  size: 32,
}))`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${Colors.primary.hex()};
`;

export const SelectContainer = styled.div`
  .title {
    display: block;
    margin-bottom: 4px;
    color: var(--cogs-greyscale-grey8);
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .cogs-select {
    min-width: 120px;
  }
`;

export const ChartContainer = styled.div`
  display: flex;
  column-gap: 24px;
  .form {
    flex: 1 1 0;
    display: flex;
    flex-flow: column nowrap;
    row-gap: 6px;
  }
  .chart {
    max-width: 720px;
    height: 240px;
    flex: 1 1 0;
    overflow: hidden;
    position: relative;
    &.short {
      height: 180px;
    }
    &.isEmpty {
      box-shadow: 0 0 0 1px var(--cogs-border-default);
      border-radius: var(--cogs-border-radius--default);
      font-style: italic;
      opacity: 0.4;
      display: flex;
      align-items: center;
      justify-content: center;
      &::after {
        content: 'No datapoints in current window';
      }
    }
    &.isLoading {
      border-radius: var(--cogs-border-radius--default);
      opacity: 0.4;
    }
  }
`;
