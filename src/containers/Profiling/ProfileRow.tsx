import React, { useState } from 'react';

import { Button, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import ColumnIcon from 'components/ColumnIcon';
import { ColumnProfile } from 'hooks/profiling-service';

import ProfileDetailsRow from './ProfileDetailsRow';
import { Graph } from './Distribution';

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
  const [expanded, setExpanded] = useState(false);
  const { label, nullCount, distinctCount, min, max, mean, histogram } =
    profile;

  return (
    <>
      <StyledTableRow
        key="profile"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <TableData>{<ColumnIcon dataKey={label} />}</TableData>
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
        <StyledExpandTableCell>
          <StyledExpandButton
            icon={expanded ? 'ChevronUp' : 'ChevronDown'}
            type="ghost"
          />
        </StyledExpandTableCell>
      </StyledTableRow>
      {expanded && <ProfileDetailsRow allCount={allCount} profile={profile} />}
    </>
  );
}

export const TableData = styled.td<{ $width?: number }>`
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  padding: 16px;
  width: ${({ $width }) => ($width !== undefined ? `${$width}px` : '')};
`;

const StyledExpandButton = styled(Button)`
  display: none;
`;

const StyledExpandTableCell = styled(TableData)`
  padding: 9px 16px 8px;
`;

const StyledTableRow = styled.tr`
  &:hover {
    background-color: ${Colors['bg-accent'].hex()};

    ${StyledExpandButton} {
      display: block;
    }
  }
`;
