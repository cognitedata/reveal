import React, { useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import ProfileDetailsRow from './ProfileDetailsRow';
import { Graph } from './Distribution';
import { ColumnProfile } from 'hooks/profiling-service';
import ColumnIcon from 'components/ColumnIcon';

export const TableData = styled.td<{ $width?: number }>`
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  padding: 16px;
  width: ${({ $width }) => ($width !== undefined ? `${$width}px` : '')};
`;

const NumberOrMissingTd = ({ value }: { value?: number }) => (
  <TableData className="numeric">
    {Number.isFinite(value) ? value : 'MISSING'}
  </TableData>
);

type Props = {
  allCount: number;
  profile: ColumnProfile;
};

export default function ProfileRow({ allCount, profile }: Props) {
  const {
    label,
    nullCount,
    distinctCount,
    min,
    max,
    mean,
    median,
    histogram,
    counts,
  } = profile;
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        key="profile"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <TableData>{<ColumnIcon title={label} />}</TableData>
        <TableData>{label}</TableData>
        <NumberOrMissingTd value={nullCount} />
        <NumberOrMissingTd value={distinctCount} />
        <TableData style={{ padding: '4px 0 0' }}>
          {histogram && (
            <Graph
              distribution={histogram}
              height={40}
              maximumBarWidth={6}
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
          distribution={histogram}
        />
      )}
    </>
  );
}
