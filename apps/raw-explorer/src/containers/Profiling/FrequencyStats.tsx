import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import Tooltip from '@raw-explorer/components/Tooltip/Tooltip';
import { TOOLTIP_DELAY_IN_MS } from '@raw-explorer/utils/constants';

import { Colors } from '@cognite/cogs.js';

export type Count = {
  value: string;
  count: number;
};
type Props = {
  allCount: number;
  counts?: Count[];
};

export default function FrequencyStats({ allCount, counts }: Props) {
  const { t } = useTranslation();

  if (!counts) return <span />;
  return (
    <FrequencyTable style={{ width: '100%' }}>
      <TableHeader>
        <tr>
          <td style={{ width: 'calc(70% - 90px)' }}>
            {t('profiling-row-frequency-stats-header-value')}
          </td>
          <td className="numeric" style={{ width: 90 }}>
            {t('profiling-row-frequency-stats-header-count')}
          </td>
          <td style={{ width: '30%' }} />
        </tr>
      </TableHeader>
      <tbody>
        {counts.map(({ value, count }) => (
          <tr key={value} className={value === '<other>' ? 'other' : undefined}>
            <StyledFrequencyTableValue>
              <Tooltip
                content={value}
                delay={TOOLTIP_DELAY_IN_MS}
                disabled={value === '<other>'}
              >
                <>{value}</>
              </Tooltip>
            </StyledFrequencyTableValue>
            <TableData>{count}</TableData>
            <TableData style={{ padding: '0 10px' }}>
              <Percent p={Math.round((count / allCount) * 100)} />
            </TableData>
          </tr>
        ))}
      </tbody>
    </FrequencyTable>
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

const FrequencyTable = styled.table`
  tr.other {
    border-top: 1px dashed ${Colors['border--muted']};
  }

  table-layout: fixed;
`;

const TableHeader = styled.thead`
  color: ${Colors['text-icon--strong']};
  border-bottom: 1px solid ${Colors['border--muted']};
`;
const TableData = styled.td`
  padding: 4px 0;
`;

const StyledFrequencyTableValue = styled(TableData)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
`;