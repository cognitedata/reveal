import styled from 'styled-components/macro';

export const ChartHolder = styled.div`
  height: calc(100% - 34px);
  margin-top: -30px;
  & > div {
    height: 100%;
    width: 50%;
    display: inline-block;
  }
`;
