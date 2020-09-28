import styled from 'styled-components';

export const StyledFigure = styled.figure<{ maxW: number }>`
  max-width: ${(props) => props.maxW}px;
  vertical-align: middle;
  margin: 0;

  .chart-text {
    fill: #000000;
    transform: translateY(0.45em);
  }

  .chart-number {
    font-size: 0.6em;
    line-height: 1;
    text-anchor: middle;
    transform: translateY(-0.4em);
  }

  .chart-label {
    font-size: 0.2em;
    text-transform: uppercase;
    text-anchor: middle;
    transform: translateY(0.7em);
  }

  .figure-key [class*='shape-'] {
    margin-right: 8px;
  }

  .figure-key-list {
    list-style: none;
    display: flex;
    justify-content: space-between;
  }

  .figure-key-list li {
    margin: 5px auto;
  }

  .shape-circle {
    display: inline-block;
    vertical-align: middle;
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background-color: grey;
    text-transform: capitalize;
  }
`;
