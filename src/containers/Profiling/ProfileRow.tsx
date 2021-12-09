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

type ProfileRowDataType = 'Empty' | 'Distinct' | 'Min' | 'Max' | 'Mean';

const availableDataTypes: Record<
  ColumnProfile['type'] | 'Unknown',
  ProfileRowDataType[]
> = {
  Boolean: ['Empty'],
  Number: ['Empty', 'Distinct', 'Min', 'Max', 'Mean'],
  Object: ['Empty'],
  String: ['Empty', 'Distinct'],
  Vector: ['Empty'],
  Unknown: [],
};

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

  const getPercentage = (portion: number, total: number) => {
    const percentage = total === 0 ? 0 : (100 * portion) / total;
    if (percentage === 0 || percentage === 100) return percentage;
    if (percentage > 0 && percentage < 10) return percentage.toFixed(2);
    else return percentage.toFixed(1);
  };
  const getLabelVariant = (percentage: number | string, type: string) => {
    if (type === 'empty') {
      if (percentage === 100) return 'danger';
      if (percentage === 0) return 'success';
    }
    if (type === 'distinct') {
      if (percentage === 100) return 'success';
    }
    return 'unknown';
  };
  const columnType = useMemo(
    () => (isFetched ? getColumnType(label) : undefined),
    [getColumnType, isFetched, label]
  );

  const emptyPercent = getPercentage(nullCount, count + nullCount);
  const distinctPercent = getPercentage(distinctCount, count);

  return (
    <>
      <StyledTableRow key="profile" onClick={() => setExpanded(!expanded)}>
        <TableCell>{<ColumnIcon dataKey={label} />}</TableCell>
        <TableCell>{label}</TableCell>
        <TableCell>
          <NumberOrMissingTd
            dataType="Empty"
            columnType={columnType}
            value={nullCount}
          >
            <Label
              size="small"
              variant={getLabelVariant(emptyPercent, 'empty')}
            >
              {emptyPercent}%
            </Label>
          </NumberOrMissingTd>
        </TableCell>
        <TableCell>
          <NumberOrMissingTd
            dataType="Distinct"
            columnType={columnType}
            value={distinctCount}
          >
            <Label
              size="small"
              variant={getLabelVariant(distinctPercent, 'distinct')}
            >
              {distinctPercent}%
            </Label>
          </NumberOrMissingTd>
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
            dataType="Min"
            columnType={columnType}
            value={min}
          />
        </TableCell>
        <TableCell numeric>
          <NumberOrMissingTd
            dataType="Max"
            columnType={columnType}
            value={max}
          />
        </TableCell>
        <TableCell numeric>
          <NumberOrMissingTd
            dataType="Mean"
            columnType={columnType}
            value={mean}
          />
        </TableCell>
        <TableCell style={{ padding: '8px 16px' }}>
          <StyledExpandButton
            aria-label="Expand row"
            icon={expanded ? 'ChevronUp' : 'ChevronDown'}
            type="ghost"
          />
        </TableCell>
      </StyledTableRow>
      {expanded && <ProfileDetailsRow allCount={allCount} profile={profile} />}
    </>
  );
}

const NumberOrMissingTd = ({
  dataType,
  columnType,
  value,
  children,
}: {
  dataType: ProfileRowDataType;
  columnType?: ColumnProfile['type'] | 'Unknown';
  value?: number;
  children?: React.ReactNode;
}) => {
  const isDataAvailable = columnType
    ? availableDataTypes[columnType].includes(dataType)
    : false;

  if (!isDataAvailable) {
    return (
      <StyledJustifyCenter>
        <Tooltip content="This information is not available for this data type">
          <CustomIcon icon="NotAvailable" style={{ width: 16 }} />
        </Tooltip>
      </StyledJustifyCenter>
    );
  }

  return Number.isFinite(value) ? (
    <>
      {value}
      {children}
    </>
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
    <StyledTD $width={$width} style={style} className="styled-cell">
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

const StyledExpandButton = styled(Button)`
  display: none;
`;

const StyledTableRow = styled.tr`
  cursor: pointer;
  .styled-cell {
    border-top: 1px solid ${Colors['greyscale-grey4'].hex()};
  }
  .styled-cell:not(:last-child) {
    border-right: 1px solid ${Colors['greyscale-grey4'].hex()};
  }
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
