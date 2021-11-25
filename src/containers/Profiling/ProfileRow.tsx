import React, { useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import { CustomIcon } from 'components/CustomIcon';
import styled from 'styled-components';
import { IconType } from 'assets/icons';
import ProfileDetailsRow from './ProfileDetailsRow';
import { Graph } from './Distribution';

export const TableData = styled.td`
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  padding: 16px;
`;

const NumberOrMissingTd = ({ value }: { value?: number }) => (
  <TableData className="numeric">
    {Number.isFinite(value) ? value : 'MISSING'}
  </TableData>
);

type Count = {
  value: string;
  count: number;
};
type Props = {
  icon?: IconType;
  label: string;
  nullCount?: number;
  distinctCount?: number;
  allCount: number;
  counts?: Count[];
  distribution?: Count[];
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
};
export default function NumberProfileRow({
  icon,
  label,
  distinctCount,
  nullCount,
  min,
  max,
  mean,
  median,
  counts,
  allCount,
  distribution,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        key="profile"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <TableData>{icon && <CustomIcon icon={icon} />}</TableData>
        <TableData>{label}</TableData>
        <NumberOrMissingTd value={nullCount} />
        <NumberOrMissingTd value={distinctCount} />
        <TableData style={{ padding: 0 }}>
          {distribution && (
            <Graph
              distribution={distribution}
              height={40}
              width={150}
              fill="rgba(140, 140, 140, 1)"
            />
          )}
        </TableData>
        <NumberOrMissingTd value={min} />
        <NumberOrMissingTd value={max} />
        <NumberOrMissingTd value={mean} />
      </tr>
      {expanded && (
        <ProfileDetailsRow
          allCount={allCount}
          nullCount={nullCount}
          min={min}
          max={max}
          median={median}
          counts={counts}
          distinctCount={distinctCount}
          distribution={distribution}
        />
      )}
    </>
  );
}
