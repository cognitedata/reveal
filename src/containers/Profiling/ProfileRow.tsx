import React, { useMemo, useState } from 'react';

import {
  Body,
  Button,
  Colors,
  Flex,
  Icon,
  Label,
  Tooltip,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import ColumnIcon from 'components/ColumnIcon';
import { CustomIcon } from 'components/CustomIcon';
import { useActiveTableContext } from 'contexts';
import { ColumnProfile, useColumnType } from 'hooks/profiling-service';

import { Graph } from './Distribution';
import ProfileDetailsRow from './ProfileDetailsRow';

type Props = {
  allCount: number;
  profile: ColumnProfile;
};

export default function ProfileRow({ allCount, profile }: Props) {
  const [expanded, setExpanded] = useState(false);
  const {
    label,
    count = 0,
    nullCount = 0,
    distinctCount = 0,
    min,
    max,
    mean,
    histogram,
  } = profile;

  const { database, table } = useActiveTableContext();
  const { getColumnType, isFetched } = useColumnType(database, table);

  const columnType = useMemo(
    () => (isFetched ? getColumnType(label) : undefined),
    [getColumnType, isFetched, label]
  );

  const emptyPercent = count === 0 ? 0 : Math.ceil((100 * nullCount) / count);
  const distinctPercent =
    count - nullCount === 0 ? 0 : Math.ceil(100 * (distinctCount / count));

  return (
    <>
      <StyledTableRow
        key="profile"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <TableCell>{<ColumnIcon dataKey={label} />}</TableCell>
        <TableCell>{label}</TableCell>
        <TableCell>
          <NumberOrMissingTd value={nullCount} />
          <Label size="small" variant="success">
            {emptyPercent}%
          </Label>
        </TableCell>
        <TableCell>
          <NumberOrMissingTd value={distinctCount} />
          <Label size="small" variant="success">
            {distinctPercent}%
          </Label>
        </TableCell>
        <TableCell style={{ padding: '4px 0 0' }}>
          {histogram && (
            <Graph
              distribution={histogram}
              height={40}
              maximumBarWidth={6}
              width={150}
              fill="rgba(140, 140, 140, 1)"
            />
          )}
        </TableCell>
        <TableCell numeric>
          <NumberOrMissingTd
            checkIfAvailable
            columnType={columnType}
            value={min}
          />
        </TableCell>
        <TableCell numeric>
          <NumberOrMissingTd
            checkIfAvailable
            columnType={columnType}
            value={max}
          />
        </TableCell>
        <TableCell numeric>
          <NumberOrMissingTd
            checkIfAvailable
            columnType={columnType}
            value={mean}
          />
        </TableCell>
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

const NumberOrMissingTd = ({
  checkIfAvailable,
  columnType,
  value,
}: {
  checkIfAvailable?: boolean;
  columnType?: ColumnProfile['type'] | 'Unknown';
  value?: number;
}) => {
  if (columnType !== 'Number' && checkIfAvailable) {
    return (
      <StyledJustifyCenter>
        <Tooltip content="This information is not available for this data type">
          <CustomIcon icon="NotAvailable" style={{ width: 16 }} />
        </Tooltip>
      </StyledJustifyCenter>
    );
  }

  return Number.isFinite(value) ? (
    <>{value}</>
  ) : (
    <StyledJustifyCenter>
      <Tooltip content="Unavailable due to error">
        <StyledInfoFilledIcon />
      </Tooltip>
    </StyledJustifyCenter>
  );
};

export const TableCell = ({ $width, numeric, children, style }: any) => {
  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: numeric ? 'flex-end' : 'space-between',
    alignItems: 'center',
  };
  return (
    <StyledTD $width={$width} style={style}>
      <Body level={2} strong style={bodyStyle}>
        {children}
      </Body>
    </StyledTD>
  );
};

const StyledTD = styled.td<{
  $width?: number;
  numeric?: boolean;
}>`
  padding: 16px;
  width: ${({ $width }) => ($width !== undefined ? `${$width}px` : '')};
  text-align: ${({ numeric }) => (numeric ? 'right' : 'left')};
`;

const StyledExpandTableCell = styled(StyledTD)`
  padding: 8px 16px;
`;

const StyledExpandButton = styled(Button)`
  display: none;
`;

const StyledTableRow = styled.tr`
  &:hover {
    background-color: ${Colors['bg-accent'].hex()};

    ${StyledExpandButton} {
      display: block;
    }
  }
`;

const StyledJustifyCenter = styled(Flex)`
  width: 100%;
  justify-content: center;
`;

const StyledInfoFilledIcon = styled(Icon).attrs({
  size: 16,
  type: 'InfoFilled',
})`
  color: ${Colors['text-hint'].hex()};
`;
