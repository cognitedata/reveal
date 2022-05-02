import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const TooltipWrapper = styled.span`
  .tooltip-container {
    ${(props: { backgroundColor: string; borderColor: boolean }) => `
      --tooltipBackground: ${props.backgroundColor};
      --tooltipBorder: ${props.borderColor};
    `}

    background-color: var(--tooltipBackground);
    border-radius: 6px;
    border: 1px solid var(--tooltipBorder);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
    color: var(--cogs-text-inverted);
    display: flex;
    flex-direction: column;
    padding: 6px;
    font-family: inherit;
    font-size: 12px;
    transition: opacity 1s ease-in-out;
    z-index: ${layers.TOOLTIP};
  }

  .tooltip-container[data-popper-interactive='false'] {
    pointer-events: none;
  }

  .tooltip-arrow {
    height: 1rem;
    position: absolute;
    width: 1rem;
    pointer-events: none;
  }

  .tooltip-arrow::before {
    border-style: solid;
    content: '';
    display: block;
    height: 0;
    margin: auto;
    width: 0;
  }

  .tooltip-arrow::after {
    border-style: solid;
    content: '';
    display: block;
    height: 0;
    margin: auto;
    position: absolute;
    width: 0;
  }

  .tooltip-container[data-popper-placement*='bottom'] .tooltip-arrow {
    left: 0;
    margin-top: -0.4rem;
    top: 0;
  }

  .tooltip-container[data-popper-placement*='bottom'] .tooltip-arrow::before {
    border-color: transparent transparent var(--tooltipBorder) transparent;
    border-width: 0 0.5rem 0.4rem 0.5rem;
    position: absolute;
    top: -1px;
  }

  .tooltip-container[data-popper-placement*='bottom'] .tooltip-arrow::after {
    border-color: transparent transparent var(--tooltipBackground) transparent;
    border-width: 0 0.5rem 0.4rem 0.5rem;
  }

  .tooltip-container[data-popper-placement*='top'] .tooltip-arrow {
    bottom: 0;
    left: 0;
    margin-bottom: -1rem;
  }

  .tooltip-container[data-popper-placement*='top'] .tooltip-arrow::before {
    border-color: var(--tooltipBorder) transparent transparent transparent;
    border-width: 0.4rem 0.5rem 0 0.5rem;
    position: absolute;
    top: 1px;
  }

  .tooltip-container[data-popper-placement*='top'] .tooltip-arrow::after {
    border-color: var(--tooltipBackground) transparent transparent transparent;
    border-width: 0.4rem 0.5rem 0 0.5rem;
  }

  .tooltip-container[data-popper-placement*='right'] .tooltip-arrow {
    left: 0;
    margin-left: -0.7rem;
  }

  .tooltip-container[data-popper-placement*='right'] .tooltip-arrow::before {
    border-color: transparent var(--tooltipBorder) transparent transparent;
    border-width: 0.5rem 0.4rem 0.5rem 0;
  }

  .tooltip-container[data-popper-placement*='right'] .tooltip-arrow::after {
    border-color: transparent var(--tooltipBackground) transparent transparent;
    border-width: 0.5rem 0.4rem 0.5rem 0;
    left: 6px;
    top: 0;
  }

  .tooltip-container[data-popper-placement*='left'] .tooltip-arrow {
    margin-right: -0.7rem;
    right: 0;
  }

  .tooltip-container[data-popper-placement*='left'] .tooltip-arrow::before {
    border-color: transparent transparent transparent var(--tooltipBorder);
    border-width: 0.5rem 0 0.5rem 0.4em;
  }

  .tooltip-container[data-popper-placement*='left'] .tooltip-arrow::after {
    border-color: transparent transparent transparent var(--tooltipBackground);
    border-width: 0.5rem 0 0.5rem 0.4em;
    left: 3px;
    top: 0;
  }
`;
