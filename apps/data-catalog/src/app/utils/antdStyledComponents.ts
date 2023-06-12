import styled from 'styled-components';

/**
 * antd components that does not exist in Cogs
 * This is temporary solution
 * - For some of components (Card, Row, Col), we should get them from Cogs
 * - For some of them, like table stuff, should have a proper replacement once moved in fusion monorepo
 */

const cssGridWidths = {
  1: '4.16666667',
  2: '8.33333333',
  3: '12.5',
  4: '16.66666667',
  5: '20.83333333',
  6: '25',
  7: '29.16666667',
  8: '33.33333333',
  9: '37.5',
  10: '41.66666667',
  11: '45.83333333',
  12: '50',
  13: '54.16666667',
  14: '58.33333333',
  15: '62.5',
  16: '66.66666667',
  17: '70.83333333',
  18: '75',
  19: '79.16666667',
  20: '83.33333333',
  21: '87.5',
  22: '91.66666667',
  23: '95.83333333',
  24: '100',
} as { [key: number]: string };

export const Col = styled.div<{ span: number }>`
  flex: 0 0 ${(p) => cssGridWidths[p.span]}%;
  max-width: ${(p) => cssGridWidths[p.span]}%;
  display: block;
  position: relative;
  max-width: 100%;
  min-height: 1px;
`;

export const Row = styled.div`
  display: flex;
  flex-flow: row wrap;
  row-gap: 0px;
`;

export const Card = styled.div`
  margin: 0;
  padding: 0;
  color: #333333;
  font-size: 14px;
  font-variant: tabular-nums;
  line-height: 1.5715;
  list-style: none;
  font-feature-settings: 'cv05';
  position: relative;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  height: auto;
  box-sizing: border-box;
  display: block;
  overflow: hidden;
`;
