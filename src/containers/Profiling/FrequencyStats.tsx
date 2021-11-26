import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

type Count = {
  value: string;
  count: number;
};
type Props = {
  allCount: number;
  counts?: Count[];
};

export default function FrequencyStats({ allCount, counts }: Props) {
  return (
    <>
      <header>Frequency statistics</header>
      {counts && (
        <FrequenceTable style={{ width: '100%' }}>
          <TableHeader>
            <tr>
              <td>Value</td>
              <td className="numeric">Count</td>
              <td />
            </tr>
          </TableHeader>
          <tbody>
            {counts.map(({ value, count }) => (
              <tr
                key={value}
                className={value === '<other>' ? 'other' : undefined}
              >
                <TableData>{value}</TableData>
                <TableData className="numeric">{count}</TableData>
                <TableData style={{ width: '30%', padding: '0 10px' }}>
                  <Percent p={Math.round((count / allCount) * 100)} />
                </TableData>
              </tr>
            ))}
          </tbody>
        </FrequenceTable>
      )}
    </>
  );
}

const PercentBG = styled.div`
  padding: 0;
  border-radius: 5px;
  background-color: #f2f2f5;
  width: 100%;
  height: 10px;
`;
const PercentBar = styled.div<{ $p: number }>`
  padding: 0;
  margin: 0;
  border-radius: 5px;
  background-color: #6e85fc;
  width: ${(props) => props.$p}%;
  height: 10px;
`;

function Percent({ p }: { p: number }) {
  return (
    <PercentBG>
      <PercentBar $p={p} />
    </PercentBG>
  );
}

const FrequenceTable = styled.table`
  tr.other {
    border-top: 1px dashed ${Colors['greyscale-grey4'].hex()};
  }
`;

const TableHeader = styled.thead`
  color: ${Colors['greyscale-grey6'].hex()};
  border-bottom: 1px solid ${Colors['greyscale-grey4'].hex()};
`;
const TableData = styled.td`
  padding: 4px 0;
`;
