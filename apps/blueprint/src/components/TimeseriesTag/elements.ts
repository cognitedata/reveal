import styled from 'styled-components/macro';

export const TimeseriesTagWrapper = styled.div<{
  color: string;
  sticky?: boolean;
}>`
  background: ${(props) => props.color};
  border-radius: 100px;
  display: flex;
  align-items: center;

  .tag--handle {
    border-radius: 100%;
    width: 24px;
    height: 24px;
    background: white;
    margin: 12px;

    &.alert {
      background: var(--cogs-danger);
      border: 2px solid white;
    }
  }

  .tag--content {
    display: flex;
    flex-direction: column;
    color: white;
    line-height: 16px;
    padding: 12px 18px 12px 0;
    pointer-events: all;
    position: relative;

    .tag--value {
      font-weight: bold;
      font-size: 18px;
      .tag--value-unit {
        font-weight: normal;
        font-size: 12px;
      }
    }
  }

  .tag--actions {
    position: absolute;
    left: 100%;
    top: 0;
    gap: 8px;
    padding-left: 16px;
    cursor: pointer;
    transform: scale(0.96);
    transition: 0.2s all;
    opacity: 0;
    display: flex;
    height: 100%;
    align-items: center;
    pointer-events: none;
    a,
    button {
      padding: 0;
      width: 24px;
      height: 24px;
      border-radius: 100%;
      background: white;
      color: black;
      display: flex;
      transition: 0.2s all;
      border: none;
      cursor: pointer;
      i {
        margin: auto;
      }
      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .tag--name,
  .tag--rule {
    bottom: 100%;
    padding: 4px 8px;
    left: -46px;
    border-radius: 100px;
    background: ${(props) => props.color};
    white-space: nowrap;
  }

  .tag--rule {
    top: 100%;
    bottom: auto;
    background: #d51a46;
  }

  .tag--hoverbox {
    min-width: 100px;
    padding: 4px;
    position: absolute;
    left: -46px;
    opacity: ${(props) => (props.sticky ? '1' : '0')};
    transform: scale(0.98);
    transition: all 0.3s;

    pointer-events: none;
    &.top {
      bottom: 100%;
    }
    &.bottom {
      top: 100%;
    }
  }

  &:hover {
    .tag--hoverbox,
    .tag--actions {
      opacity: 1;
      transform: scale(1);
      pointer-events: all;
    }
  }
`;
