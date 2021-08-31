import styled from 'styled-components';

import { Col } from '@cognite/cogs.js';

export const ModelDetailSettingContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TableContainer = styled.div`
  display: inline-table;

  table {
    table-layout: fixed;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: smaller;
    margin-top: 12px;

    td {
      padding: 16px;
    }
  }
`;

export const StyledCol = styled(Col)`
  justify-content: center;
  display: flex;
`;

export const ColorBox = styled.div<{ color: string }>`
  width: 28px;
  height: 28px;
  background: ${(props) => props.color};
`;
export const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  text-align: left;
  width: 200px;
  padding-bottom: 6px;
`;
